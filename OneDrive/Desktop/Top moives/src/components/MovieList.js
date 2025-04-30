import React from "react";

/**
 * MovieList Component
 *
 * Displays a list of movies in a scrollable container.
 * Each movie is rendered using the Movie component.
 *
 * Props:
 * - movies: Array of movie objects to display
 * - onSelectMovie: Function to handle movie selection
 */
export function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

/**
 * Movie Component
 *
 * Renders a single movie item in the list.
 * Shows the movie poster, title, and year.
 *
 * Props:
 * - movie: Object containing movie details (imdbID, Title, Year, Poster)
 * - onSelectMovie: Function to handle movie selection
 */
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
