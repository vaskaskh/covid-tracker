import React, { useEffect, useState } from 'react';
import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import './App.css';
import InfoBox from './InfoBox/InfoBox';
import Map from './Map/Map';
import Table from './Table/Table';
import { prettyPrintStat, sortData } from './util';
import LineGraph from './LineGraph/LineGraph';
import 'leaflet/dist/leaflet.css';

function App() {

    const [countries, setCountries] = useState([]);

    const [country, setCountry] = useState("worldWide");

    const [ countryInfo, setCountryInfo] = useState({});

    const [tableData, setTableData] = useState([])

    const [mapCenter, setMapCenter] = useState({lat: 34.80746, lng: -40.4796})

    const [mapZoom, setMapZoom] = useState(2);

    const [mapCountries, setMapCountries] = useState([]);

    const [casesType, setCasesType] = useState("cases");

useEffect(()=>{
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response=> response.json())
    .then(data=>{
        setCountryInfo(data)
    })
},[])


    useEffect(()=>{
        const getCountriesData = async()=>{
            await fetch('https://disease.sh/v3/covid-19/countries')
            .then((response)=> response.json())
            .then((data)=>{
                const  countries =  data.map(country=>(
                    {
                        name: country.country,
                        value: country.countryInfo.iso2
                    }
                ))

                const sortedData = sortData(data);

                setTableData(sortedData);
                setMapCountries(data);
                setCountries(countries); 
            })
        };

        getCountriesData();
    },[]);



    const onCountryChange = async (event)=>{
        const countryCode = event.target.value;

        setCountry(countryCode);


        const url = countryCode === 'worldWide'
        ? "https://disease.sh/v3/covid-19/all" 
        :`https://disease.sh/v3/covid-19/countries/${countryCode}`;

        await fetch(url)
        .then(response=>response.json())
        .then(data=>{
            setCountry(countryCode);
            setCountryInfo(data);



            setMapCenter([data.countryInfo.lat, data.countryInfo.long]);

            setMapZoom(4);
        })

    };


    return (
        <div className='app'>
            
        <div className='app_left'>
            <div className='app_header'>

            <h1>Covid-19 TRACKER</h1>   
                      
                <FormControl className='app_dropdown' >
                    <Select 
                    onChange={onCountryChange}
                    variant='outlined'  
                    value={country}>
                       
                       <MenuItem value="worldWide">WorldWide</MenuItem>
                       {
                           countries.map((country)=>(
                               <MenuItem value={country.value}>
                                {country.name}
                               </MenuItem>
                           ))
                       }
                    </Select>
                </FormControl>
            
            </div>

            <div className='app_stats'>
                       <InfoBox  
                       isRed
                        active={casesType=== "cases"}
                            onClick={e => setCasesType('cases')}
                       cases={
                           prettyPrintStat(
                           countryInfo.todayCases)}title='Coronavirus cases' total={
                            prettyPrintStat(
                               countryInfo.cases)}/>

                       <InfoBox  

                    active={casesType=== "recovered"}
                         onClick={e => setCasesType('recovered')}
                       cases={
                            prettyPrintStat(
                           countryInfo.todayRecovered)} title='Recovered' total={
                            prettyPrintStat(
                               countryInfo.recovered)}/>

                       <InfoBox  
                       isRed
                    active={casesType=== "deaths"}
                       onClick={e => setCasesType('deaths')}cases={
                            prettyPrintStat(
                           countryInfo.todayDeaths)} title='Deaths' total={
                            prettyPrintStat(
                               countryInfo.deaths)}/>
            </div>


             <Map casesType={casesType}  countries={mapCountries} center={mapCenter} zoom={mapZoom}/>
         </div>
        <div className='App_right'>

            <Card>
                    <CardContent>
                        <h3>Live Cases by Country</h3>
                            <Table countries={tableData} title='hello'/>
                            <h3>Worldwide new {casesType}</h3>

                        <LineGraph
                        casesType={casesType}
                        />

                    </CardContent>
            </Card>
        </div>

        </div>
    )
}

export default App
