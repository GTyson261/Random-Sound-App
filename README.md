## API Used
Freesound API  
https://freesound.org/docs/api/

## How to Run Locally

1. Clone the repository:
   git clone https://github.com/yourusername/random-sound-player.git

2. Navigate into the project:
   cd random-sound-player

3. Install dependencies:
   npm install

4. Start the development server:
   npm run dev

## Technical Challenge

One challenge I encountered was correctly accessing the audio preview from the API response. Initially, the sound would not play because I was referencing the wrong property. I resolved this by inspecting the returned JSON and using the correct field: previews["preview-hq-mp3"]. I also added checks to ensure a valid preview exists before rendering the audio player.