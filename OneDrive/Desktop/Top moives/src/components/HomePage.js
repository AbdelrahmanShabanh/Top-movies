import React, { useEffect, useState, useRef } from "react";
import StarRating from "../starRating";
import "../index.css";

const sliderImages = [
  require("../assets/500days.jpg"),
  require("../assets/johnwick.jpg"),
  require("../assets/wolfofwallstreet.jpg"),
];

// Hardcoded IMDb IDs for Top 10 IMDb movies
const top10IMDbIDs = [
  "tt15398776", // The Last of Us
  "tt3032476", // Better Call Saul
  "tt0903747", // Breaking Bad
  "tt7366338", // Chernobyl
  "tt0944947", // Game of Thrones
  "tt4574334", // Stranger Things
  "tt2395695", // Hannibal
  "tt0141842", // The Sopranos
  "tt2861424", // Rick and Morty
  "tt0411008", // Lost
];

const OMDB_KEY = "d799ad1a";

export default function HomePage({
  onMovieSelect,
  selectedMovie,
  onAddToWatched,
  onCloseModal,
}) {
  const [current, setCurrent] = useState(0);
  const [upNext, setUpNext] = useState([]);
  const [top10, setTop10] = useState([]);
  const sliderInterval = useRef(null);

  // Fetch 'Up Next' movies
  useEffect(() => {
    async function fetchUpNext() {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${OMDB_KEY}&s=action&type=movie&page=1`
      );
      const data = await res.json();
      setUpNext(data.Search ? data.Search.slice(0, 3) : []);
    }
    fetchUpNext();
  }, []);

  // Fetch Top 10 IMDb movies
  useEffect(() => {
    async function fetchTop10() {
      const movies = await Promise.all(
        top10IMDbIDs.map(async (id) => {
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${id}`
          );
          return await res.json();
        })
      );
      setTop10(movies);
    }
    fetchTop10();
  }, []);

  // Auto-slide logic
  useEffect(() => {
    sliderInterval.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(sliderInterval.current);
  }, []);

  function nextSlide() {
    setCurrent((prev) => (prev + 1) % sliderImages.length);
  }
  function prevSlide() {
    setCurrent(
      (prev) => (prev - 1 + sliderImages.length) % sliderImages.length
    );
  }

  function openTrailer(title) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      title + " trailer"
    )}`;
    window.open(url, "_blank");
  }

  return (
    <div className="homepage-flex">
      {/* Slider and Up Next side by side */}
      <div className="slider-upnext-container">
        <div className="slider-card">
          <button className="slider-btn left" onClick={prevSlide}>
            &lt;
          </button>
          <img
            src={sliderImages[current]}
            alt="slider"
            className="slider-img-fixed"
          />
          <button className="slider-btn right" onClick={nextSlide}>
            &gt;
          </button>
        </div>
        <section className="up-next-card">
          <h2 className="up-next-title">Up next</h2>
          <div className="up-next-list">
            {upNext.map((movie) => (
              <div
                className="up-next-item-card"
                key={movie.imdbID}
                onClick={() => onMovieSelect(movie)}
                style={{ cursor: "pointer" }}
              >
                <div className="up-next-img-wrap">
                  <img
                    src={movie.Poster}
                    alt={movie.Title}
                    className="up-next-img"
                  />
                  <span className="play-icon">▶</span>
                </div>
                <div className="up-next-info">
                  <h4 className="up-next-movie-title">{movie.Title}</h4>
                  <p className="up-next-movie-year">{movie.Year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      {/* Top 10 IMDb */}
      <section className="top10-imdb">
        <h2>Top 10 on IMDb this week</h2>
        <div className="top10-list top10-5perrow">
          {top10.map((movie, i) => (
            <div className="top10-item top10-card" key={movie.imdbID}>
              <div className="top10-card-poster-wrap">
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  className="top10-card-poster"
                />
                <span className="top10-card-index">{i + 1}</span>
              </div>
              <div className="top10-card-content">
                <h4 className="top10-card-title">{movie.Title}</h4>
                <div className="top10-card-rating">
                  <span
                    style={{
                      color: "#ffb700",
                      fontWeight: 700,
                      fontSize: 16,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 18, marginRight: 3 }}>★</span>
                    {movie.imdbRating}
                  </span>
                </div>
                <div className="top10-card-btns">
                  <button
                    className="top10-btn"
                    onClick={() => onMovieSelect(movie)}
                  >
                    View Details
                  </button>
                  <button
                    className="top10-btn-tralier"
                    onClick={() => openTrailer(movie.Title)}
                  >
                    Trailer
                  </button>
                  <button className="top10-btn top10-btn-watchlist">
                    + Watchlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onAddToWatched={onAddToWatched}
          onClose={onCloseModal}
        />
      )}
    </div>
  );
}

function MovieDetailsModal({ movie, onAddToWatched, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${movie.imdbID}`
      );
      const data = await res.json();
      setDetails(data);
      setLoading(false);
    }
    fetchDetails();
  }, [movie.imdbID]);

  function openTrailer(title) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      title + " trailer"
    )}`;
    window.open(url, "_blank");
  }

  if (loading || !details)
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <p>Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="btn-back" onClick={onClose}>
          &larr;
        </button>
        <div style={{ display: "flex", gap: 24 }}>
          <img
            src={details.Poster}
            alt={details.Title}
            style={{
              width: 180,
              height: 260,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ color: "#ffb700", marginBottom: 8 }}>
              {details.Title} ({details.Year})
            </h2>
            <div style={{ color: "#aaa", marginBottom: 8 }}>
              {details.Genre} | {details.Runtime}
            </div>
            <div style={{ color: "#fff", marginBottom: 8 }}>{details.Plot}</div>
            <div style={{ color: "#aaa", marginBottom: 8 }}>
              Director: {details.Director}
            </div>
            <div style={{ color: "#aaa", marginBottom: 8 }}>
              Actors: {details.Actors}
            </div>
            <div style={{ color: "#ffb700", marginBottom: 8 }}>
              IMDb: {details.imdbRating}
            </div>
            <div style={{ margin: "16px 0" }}>
              <label style={{ color: "#fff", fontWeight: 600 }}>
                Your rating:{" "}
              </label>
              <StarRating
                maxRating={10}
                size={24}
                onSetRating={setRating}
                rating={rating}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <textarea
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 50,
                  borderRadius: 4,
                  padding: 6,
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn-add"
                onClick={() => onAddToWatched(details, rating, comment)}
                disabled={rating < 1 || rating > 10}
              >
                Save to watched
              </button>
              <button
                className="btn-add"
                style={{ background: "#ffb700", color: "#181818" }}
                onClick={() => openTrailer(details.Title)}
              >
                Watch Trailer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
