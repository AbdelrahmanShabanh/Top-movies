import React, { useState, useEffect, useRef } from "react";
import HomePage from "./components/HomePage";
import "./index.css";

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img"></span>
      <h1>Top Movies</h1>
    </div>
  );
}
function SearchBar({ query, setQuery, onResultClick, results, resultsCount }) {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%" }}
      />
      {results && results.length > 0 && (
        <div>
          <div
            style={{
              color: "#ffb700",
              fontWeight: 600,
              padding: "0.5rem 1.2rem 0 1.2rem",
              fontSize: "1.2rem",
            }}
          >
            {resultsCount} results found
          </div>
          <ul className="search-dropdown">
            {results.map((movie) => (
              <li key={movie.imdbID} onClick={() => onResultClick(movie)}>
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  style={{
                    width: 30,
                    height: 45,
                    objectFit: "cover",
                    borderRadius: 4,
                    marginRight: 8,
                  }}
                />
                {movie.Title} ({movie.Year})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function getWatchedFromStorage() {
  try {
    const data = localStorage.getItem("watchedMovies");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [watched, setWatched] = useState(getWatchedFromStorage);
  const [showWatched, setShowWatched] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [flyPoster, setFlyPoster] = useState(null);
  const watchedBadgeRef = useRef();

  // Persist watched list to localStorage
  useEffect(() => {
    localStorage.setItem("watchedMovies", JSON.stringify(watched));
  }, [watched]);

  // Search logic
  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    fetch(`https://www.omdbapi.com/?apikey=d799ad1a&s=${searchQuery}`)
      .then((res) => res.json())
      .then((data) => {
        // Filter results by title containing the query (case-insensitive)
        const filtered = (data.Search || []).filter((movie) =>
          movie.Title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
        setSearchLoading(false);
      });
  }, [searchQuery]);

  function handleMovieSelect(movie) {
    setSelectedMovie(movie);
    setSearchResults([]);
    setSearchQuery("");
  }

  // Animation: fly poster to watched badge
  function handleAddToWatched(movie, rating, comment) {
    // Find the modal poster image position
    const modalPoster = document.querySelector(".modal-content img");
    const badge = watchedBadgeRef.current;
    if (modalPoster && badge) {
      const posterRect = modalPoster.getBoundingClientRect();
      const badgeRect = badge.getBoundingClientRect();
      setFlyPoster({
        src: movie.Poster,
        style: {
          left: posterRect.left + "px",
          top: posterRect.top + "px",
          width: posterRect.width + "px",
          height: posterRect.height + "px",
          "--fly-x": `${badgeRect.left - posterRect.left}px`,
          "--fly-y": `${badgeRect.top - posterRect.top}px`,
        },
      });
      setTimeout(() => {
        setFlyPoster(null);
        setShowWatched(true);
      }, 800);
    } else {
      setShowWatched(true);
    }
    setWatched((prev) => [
      ...prev.filter((m) => m.imdbID !== movie.imdbID),
      { ...movie, userRating: rating, userComment: comment },
    ]);
    setSelectedMovie(null);
  }
  function handleRemoveWatched(id) {
    setWatched((prev) => prev.filter((m) => m.imdbID !== id));
  }

  // Watched stats
  const totalMovies = watched.length;
  const totalMinutes = watched.reduce(
    (sum, m) => sum + (parseInt(m.Runtime) || 0),
    0
  );
  const totalHours = (totalMinutes / 60).toFixed(1);
  const avgRating = watched.length
    ? (
        watched.reduce((sum, m) => sum + (parseFloat(m.userRating) || 0), 0) /
        watched.length
      ).toFixed(2)
    : 0;

  return (
    <>
      <NavBar>
        <SearchBar
          query={searchQuery}
          setQuery={setSearchQuery}
          onResultClick={handleMovieSelect}
          results={searchResults}
          resultsCount={searchResults.length}
        />
        <div
          style={{
            justifySelf: "end",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {totalMovies > 0 && (
            <span ref={watchedBadgeRef} className="watched-counter-badge">
              {totalMovies}
            </span>
          )}
          <span
            className="watched-toggle"
            style={{ cursor: "pointer" }}
            onClick={() => setShowWatched((s) => !s)}
          >
            Movies you watched
          </span>
        </div>
      </NavBar>
      <HomePage
        onMovieSelect={handleMovieSelect}
        selectedMovie={selectedMovie}
        onAddToWatched={handleAddToWatched}
        watched={watched}
        showWatched={showWatched}
        onRemoveWatched={handleRemoveWatched}
        onCloseModal={() => setSelectedMovie(null)}
      />
      {flyPoster && (
        <img
          src={flyPoster.src}
          className="fly-to-watched"
          style={flyPoster.style}
          alt="flying poster"
        />
      )}
      {showWatched && (
        <div className="watched-box-modal">
          <h3 style={{ color: "#ffb700", margin: "1rem 0" }}>
            Movies you watched
          </h3>
          <div style={{ color: "#fff", fontWeight: 600, marginBottom: 8 }}>
            Total: {totalMovies} movies | {totalHours} hours | Avg rating:{" "}
            {avgRating}
          </div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {watched.map((movie) => (
              <li
                key={movie.imdbID}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  style={{
                    width: 40,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 4,
                    marginRight: 10,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontWeight: 600 }}>
                    {movie.Title}
                  </div>
                  <div style={{ color: "#aaa", fontSize: 13 }}>
                    {movie.userRating ? `⭐ ${movie.userRating}` : "Not rated"}
                  </div>
                  {movie.userComment && (
                    <div
                      style={{
                        color: "#aaa",
                        fontSize: 12,
                        fontStyle: "italic",
                      }}
                    >
                      {movie.userComment}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveWatched(movie.imdbID)}
                  style={{
                    background: "#e50914",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 8px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <footer className="footer">
        &copy; {new Date().getFullYear()} Top Movies &mdash; Movie Explorer. Not
        affiliated with IMDb.
        <br />
        Made with <span style={{ color: "#ffb700" }}>🍿</span> for movie lovers.
      </footer>
    </>
  );
}
