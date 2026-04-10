import { useEffect, useState } from "react";
import "./App.css";

const API_KEY = "DAph77eiWgW6u2lkvSc9rG8fGu6QStN0LWBi8o7C";

function App() {
  const [sound, setSound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSound = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `https://freesound.org/apiv2/search/text/?query=ambient&fields=name,previews,username&token=${API_KEY}`
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      const random =
        data.results[Math.floor(Math.random() * data.results.length)];

      setSound(random);
    } catch (err) {
      setError("Failed to load sound.");
      setSound(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSound();
  }, []);

  return (
    <div className="app">
      <h1>Random Sound Player</h1>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {sound && (
        <div>
          <h2>{sound.name}</h2>
          <p>{sound.username}</p>

          <audio controls src={sound.previews["preview-hq-mp3"]} />
        </div>
      )}

      <button onClick={fetchSound}>New Sound</button>
    </div>
  );
}

export default App;