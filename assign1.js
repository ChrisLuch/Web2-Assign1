function popup() {
    let label = document.querySelector('.header span');
    label.style.display = 'block';
    setTimeout(() => {label.style.display = 'none';},5000);
};

function initMap(latitude, longitude) {
    new google.maps.Map(document.querySelector('div.mapBox'), {
        center: {lat: latitude, lng: longitude},
        mapTypeId: 'satellite',
        zoom: 18
    });
};

document.addEventListener("DOMContentLoaded", function() {
    const companyList = "https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php";
    const stockData = "https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=";

    document.querySelector('#loader1').style.display = "none";
    document.querySelector('#loader2').style.display = "none";
    let list = document.querySelector('#companyList');
    list.style.display = "none";

    //Add listener to the header label
    document.getElementById('credits').addEventListener('mouseover', popup);
    
    //If the data hasn't been stored, fetch and store it before making the list
    if(localStorage.getItem("companyData") == null) getCompanyInfo();
    else createList();

    

    function getCompanyInfo(){
        //Display loading animation
        document.querySelector('#loader1').style.display = "block";
        
        fetch(companyList)
            .then(resp => {
                //Make sure the link is ok
                if(resp.ok) return resp.json();
                else{
                    Promise.reject({
                        status: resp.status,
                        statusText: resp.statusText
                    })
                }
            })
            .then(data => {
                //Store data in local storage and remove loading animation
                localStorage.setItem('companyData', JSON.stringify(data));
                document.querySelector('#loader1').style.display = "none";
                createList();
            })
            .catch(err => console.log(err));
    }

    //Create the clickable company list with the data
    function createList(){
        let data = JSON.parse(localStorage.getItem("companyData"));
        print(data);

        //Filter the list
        let filter = document.querySelector('#filter');
        filter.addEventListener('change', function(){
            print(data.filter(company => company.symbol.startsWith(filter.value.toUpperCase())))
        });
        
        //Reset the filter
        document.querySelector('#clear').addEventListener('click', () => print(data));

        //Print the list
        function print(chosenData){
            list.innerHTML = '';
            chosenData.forEach(company => {
            let item = document.createElement('li');
            item.textContent = company.name;
            item.addEventListener('click', function(){chooseCompany(company)});
            list.appendChild(item);
        });}

        //Sort the list alphabetically
        //Sorting algorithm from https://www.w3schools.com/howto/howto_js_sort_list.asp
        let switchEm, i;
        let notDone = true;
        while(notDone){
            notDone = false;
            let items = list.getElementsByTagName('li');
            for(i = 0; i < (items.length-1); i++){
                switchEm = false;
                if(items[i].innerHTML.toLowerCase() > items[i+1].innerHTML.toLowerCase()){
                    switchEm = true;
                    break;
                }
            }
            if(switchEm){
                items[i].parentNode.insertBefore(items[i+1],items[i]);
                notDone = true;
            }
        }

        //Display the list
        document.querySelector('#companyList').style.display = "block";
    }

    //Display data for the chosen company
    function chooseCompany(chosen){
        let logo = document.querySelector('#CompanyLogo');
        logo.src = './logos/'+chosen.symbol+'.svg';
        logo.alt = chosen.name;
        logo.title = chosen.name;
        document.querySelector('#companySymbol').textContent = chosen.symbol;
        document.querySelector('#companyName').textContent = chosen.name;
        document.querySelector('#companySector').textContent = chosen.sector;
        document.querySelector('#companySub').textContent = chosen.subindustry;
        document.querySelector('#companyAdress').textContent = chosen.address;
        link = document.querySelector('#companyHome');
        link.href = chosen.website;
        link.textContent = chosen.website;
        document.querySelector('#companyExchange').textContent = chosen.exchange;
        document.querySelector('#companyDescription').textContent = chosen.description;
        document.querySelector('.companyInfo section').style.display = 'grid';

        //Display the map
        initMap(chosen.latitude, chosen.longitude);

        //Fetch the stock data if it hasn't already been fetched
        if(localStorage.getItem('stocks'+chosen.symbol) == null){
            //Display loading animation
            document.querySelector('.stocks #stockTable').style.display = "none";
            document.querySelector('#loader2').style.display = "block";

            fetch(stockData+chosen.symbol)
            .then(resp => {
                //Make sure the link is ok
                if(resp.ok) return resp.json();
                else{
                    Promise.reject({
                        status: resp.status,
                        statusText: resp.statusText
                    });
                }
            })
            .then(data => {
                //Store data in local storage and remove loading animation
                localStorage.setItem('stocks'+chosen.symbol, JSON.stringify(data));
                document.querySelector('#loader2').style.display = "none";
                createTable(chosen.symbol);
            })
            .catch(err => console.log(err));
        }
        else createTable(chosen.symbol);
        
        function createTable(symbol){
            let stockTable = document.querySelector('.stocks #stockTable');
            stockTable.innerHTML = '';
            let data = JSON.parse(localStorage.getItem('stocks'+symbol));

            //Format the stock data into the table
            data.forEach(entry => {
                let row = document.createElement('tr');
                let date = document.createElement('td');
                date.textContent = entry.date;
                row.appendChild(date);
                let open = document.createElement('td');
                open.textContent = Number(entry.open).toLocaleString('en');
                row.appendChild(open);
                let close = document.createElement('td');
                close.textContent = Number(entry.close).toLocaleString('en');
                row.appendChild(close);
                let low = document.createElement('td');
                low.textContent = Number(entry.low).toLocaleString('en');
                row.appendChild(low);
                let high = document.createElement('td');
                high.textContent = Number(entry.high).toLocaleString('en');
                row.appendChild(high);
                let vol = document.createElement('td');
                vol.textContent = Number(entry.volume).toLocaleString('en');
                row.appendChild(vol);
                stockTable.appendChild(row);
            });
            stockTable.style.display = "block";

            //Use the headers to sort the table
            document.querySelector('#date').addEventListener('click', () => sort(0));
            document.querySelector('#open').addEventListener('click', () => sort(1));
            document.querySelector('#close').addEventListener('click', () => sort(2));
            document.querySelector('#low').addEventListener('click', () => sort(3));
            document.querySelector('#high').addEventListener('click', () => sort(4));
            document.querySelector('#vol').addEventListener('click', () => sort(5));

            //Add sorting ability to the table
            //Sorting algorithm from https://www.w3schools.com/howto/howto_js_sort_table.asp
            function sort(which){
                let switchEm, i;
                let notDone = true;
                while(notDone){
                    notDone = false;
                    let rows = stockTable.rows;
                    for(i = 0; i < (rows.length-1); i++){
                        switchEm = false;
                        let x = rows[i].getElementsByTagName('td')[which];
                        let y = rows[i+1].getElementsByTagName('td')[which];
                        if(x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()){
                            switchEm = true;
                            break;
                        }
                    }
                    if(switchEm){
                        rows[i].parentNode.insertBefore(rows[i+1],rows[i]);
                        notDone = true;
                    }
                }
            }
        }
    }
    //Implement the chart button
    document.querySelector('.chartButton').addEventListener('click', () => swapView);
    
    function swapView(){
        //Hide default view
        document.querySelector('.companies').style.display = "none";
        document.querySelector('.companyInfo').style.display = "none";
        document.querySelector('.mapBox').style.display = "none";
        document.querySelector('.stocks').style.display = "none";
        document.querySelector('.aveMinMax').style.display = "none";
    }
});