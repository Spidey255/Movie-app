import React from 'react'
import hero from './assets/hero.png';
import Search from './components/Search';
import { useState,useEffect } from 'react';
import Spinner from './components/Spinner';
import { MovieCard } from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchTerm } from './appwrite';
const API_BASE_URL ='https://api.themoviedb.org/3' ;
const  API_KEY=import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
}



function App() {
  const [searchterm, setSearchterm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies,setTrendingMovies]=useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm,setDebounceSearchTerm] = useState('');

  useDebounce(()=>{
      setDebounceSearchTerm(searchterm)
  }
  ,500,[searchterm]);
  const fetchMovies = async(query) =>{
    try{
      setIsLoading(true);
      const endpoint = query?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`:`${API_BASE_URL}/discover/movie?sort_by=popularity,desc`;

      const response=await fetch(endpoint,API_OPTIONS);
      if(!response.ok){
          throw new Error('Failed to fetch movies')
        }
        const data = await response.json();

        if(data.response==='False'){
          setErrorMessage(data.Error||'Failed to fetch data');
          setMovieList([]);
          return;
        }
        console.log(data);
        setMovieList(data.results||[]);
        if(query && data.results.length>0){ 
          await updateSearchTerm(query,data.results[0]);
        }
    }
    catch(e){
      console.error(e.msg);
    }
    finally{
      setIsLoading(false);
    }
  }

const loadTrendingMovies=async()=>{
  try{
    const movies=await getTrendingMovies();
    setTrendingMovies(movies);
  }
  catch(e){
    console.error('Error Fetching Trending Moviesw'+e);
  }
}

  useEffect(()=>{
    fetchMovies(debouncedSearchTerm);
  },[debouncedSearchTerm])


  useEffect(()=>{
    loadTrendingMovies();
  },[])

  return (
    <>
        <div className="pattern" />
        <div className="wrapper">
            <header>
                <img src={hero} alt="Hero Banner"/>
                <h1>Find <span className="text-gradient">Movies </span> you'll enjoy without the Hassle</h1>
                <Search searchterm={searchterm} setSearchterm={setSearchterm}/>
            </header>
            {trendingMovies.length>0 &&(
              <section className="trending">
                <h2>Trending Movies</h2>
                <ul>
                  {trendingMovies.map((movie,index)=>(
                    <li key={movie.$id}>
                      <p>{index+1}</p>
                      {index+1}. <img src={movie.poster_url} alt={movie.searchTerm}/>
                    </li>
                  ))}
                </ul>
              </section>
            )}
           <section className="all-movies">
            <h2>All Movies</h2>
            {isLoading?( <Spinner/>):
              errorMessage?(<p className="text-red-500">{errorMessage}</p>):(
                <ul>
                  {movieList.map((movie)=>(
                    <MovieCard movie={movie} key={movie.id}/>
                  ))}
                </ul>
              )}
           </section>
        </div>
    </>
  )
}

export default App