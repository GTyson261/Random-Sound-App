import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_KEY = "DAph77eiWgW6u2lkvSc9rG8fGu6QStN0LWBi8o7C";

function App() {
  const [sound, setSound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favoriteSounds");
    return saved ? JSON.parse(saved) : [];
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef(null);

  const fetchSound = async () => {
    try {
      setLoading(true);
      setError("");

      const url =
        `https://freesound.org/apiv2/search/text/` +
        `?query=ambient` +
        `&fields=name,username,previews,id` +
        `&page_size=20` +
        `&token=${API_KEY}`;

      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("No sounds found.");
      }

      const validSounds = data.results.filter(
        (item) =>
          item &&
          item.previews &&
          (item.previews["preview-hq-mp3"] || item.previews["preview-lq-mp3"])
      );

      if (validSounds.length === 0) {
        throw new Error("No playable preview found.");
      }

      const random =
        validSounds[Math.floor(Math.random() * validSounds.length)];

      setSound(random);
      setIsPlaying(false);
    } catch (err) {
      setSound(null);
      setError(err.message || "Failed to load sound.");
    } finally {
      setLoading(false);
    }
  };

  const saveFavorite = () => {
    if (!sound) return;

    const alreadySaved = favorites.some((item) => item.id === sound.id);
    if (alreadySaved) return;

    const updated = [...favorites, sound];
    setFavorites(updated);
    localStorage.setItem("favoriteSounds", JSON.stringify(updated));
  };

  const playFavorite = (savedSound) => {
    setSound(savedSound);
    setIsPlaying(false);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 100);
  };

  const removeFavorite = (id) => {
    const updated = favorites.filter((item) => item.id !== id);
    setFavorites(updated);
    localStorage.setItem("favoriteSounds", JSON.stringify(updated));
  };

  useEffect(() => {
    fetchSound();
  }, []);

  const previewUrl =
    sound?.previews?.["preview-hq-mp3"] || sound?.previews?.["preview-lq-mp3"];

  return (
    <div className="app">
      <div className="card">
        <h1>Random Sound Player</h1>
        <p className="subtitle">Discover random audio clips</p>

        {loading && <p className="status">Loading sound...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && sound && (
          <div className="sound-box">
            <h2>{sound.name}</h2>
            <p>By: {sound.username}</p>

            <div className={`visualizer ${isPlaying ? "playing" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <audio
              ref={audioRef}
              controls
              src={previewUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            >
              Your browser does not support audio.
            </audio>

            <div className="button-row">
              <button onClick={fetchSound} disabled={loading}>
                {loading ? "Loading..." : "New Sound"}
              </button>
              <button onClick={saveFavorite} className="secondary-btn">
                Save Favorite
              </button>
            </div>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="favorites-box">
            <h2>Saved Favorites</h2>

            {favorites.map((item) => {
              const itemPreview =
                item.previews?.["preview-hq-mp3"] ||
                item.previews?.["preview-lq-mp3"];

              return (
                <div key={item.id} className="favorite-item">
                  <div>
                    <h3>{item.name}</h3>
                    <p>By: {item.username}</p>
                  </div>

                  <div className="favorite-actions">
                    <button onClick={() => playFavorite(item)}>Replay</button>
                    <button
                      onClick={() => removeFavorite(item.id)}
                      className="delete-btn"
                    >
                      Remove
                    </button>
                  </div>

                  <audio controls src={itemPreview}>
                    Your browser does not support audio.
                  </audio>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;