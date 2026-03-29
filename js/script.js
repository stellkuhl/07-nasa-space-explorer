// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Get other elements from the page
const gallery = document.getElementById("gallery");
const button = document.getElementById("getImagesBtn");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeModal");
const modalBody = document.getElementById("modalBody");
const factText = document.getElementById("factText");

// Use your NASA API key here
const apiKey = "2Pbk47bTauuk62ZVF7UjtCElgedKKkJuwUscKGeH";

// A short list of fun space facts for beginners
const spaceFacts = [
  "A day on Venus is longer than a year on Venus.",
  "Neutron stars can spin more than 600 times every second.",
  "The footprints on the Moon can last for millions of years.",
  "Jupiter is so big that more than 1,300 Earths could fit inside it.",
  "Sunlight takes about 8 minutes and 20 seconds to reach Earth.",
  "Olympus Mons on Mars is the largest volcano in the solar system."
];

// Pick and show one random fact each time the page loads
function showRandomSpaceFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  factText.textContent = spaceFacts[randomIndex];
}

showRandomSpaceFact();

// Build a thumbnail URL when APOD entry is a YouTube video
function getYouTubeThumbnailUrl(videoUrl) {
  try {
    const parsedUrl = new URL(videoUrl);
    let videoId = "";

    if (parsedUrl.hostname.includes("youtube.com")) {
      videoId = parsedUrl.searchParams.get("v");
    }

    if (parsedUrl.hostname.includes("youtu.be")) {
      videoId = parsedUrl.pathname.replace("/", "");
    }

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  } catch (error) {
    console.log("Could not build YouTube thumbnail URL:", error);
  }

  return null;
}


// When button is clicked, run the function
button.addEventListener("click", getSpaceImages);

// Handle closing the modal
closeBtn.addEventListener("click", closeModal);

// Close modal when clicking outside the content
modal.addEventListener("click", function(event) {
  if (event.target === modal) {
    closeModal();
  }
});

// Function to open the modal with image details
function openModal(item) {
  modalBody.innerHTML = `
    <img src="${item.url}" alt="${item.title}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #0b3d91; margin-bottom: 10px;">${item.title}</h2>
    <p style="color: #666; font-size: 14px; margin-bottom: 15px;"><strong>Date:</strong> ${item.date}</p>
    <p style="color: #444; line-height: 1.6;">${item.explanation}</p>
  `;
  modal.classList.remove("hidden");
}

// Function to close the modal
function closeModal() {
  modal.classList.add("hidden");
}

async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Check that both dates are selected
  if (!startDate || !endDate) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>Please select both dates first.</p>
      </div>
    `;
    return;
  }

  // Show loading message
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos...</p>
    </div>
  `;

  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Clear gallery before adding cards
    gallery.innerHTML = "";

    // Reverse so newest entries show first
    data.reverse();

    data.forEach(function(item) {
      const card = document.createElement("div");
      card.classList.add("gallery-item");

      // Show image entries
      if (item.media_type === "image") {
        card.innerHTML = `
          <img src="${item.url}" alt="${item.title}">
          <div class="card-text">
            <h3>${item.title}</h3>
            <p>${item.date}</p>
          </div>
        `;

        // Add click event to open modal with full details
        card.addEventListener("click", function() {
          openModal(item);
        });

        gallery.appendChild(card);
      }

      // Show video entries with a clear link to watch
      if (item.media_type === "video") {
        const videoThumbnailUrl = getYouTubeThumbnailUrl(item.url);

        card.innerHTML = `
          <div class="video-card-preview">
            <span class="video-badge">Video</span>
            ${videoThumbnailUrl
              ? `<img src="${videoThumbnailUrl}" alt="Video thumbnail for ${item.title}" class="video-thumbnail">`
              : `<p>🎬</p>`
            }
          </div>
          <div class="card-text">
            <h3>${item.title}</h3>
            <p>${item.date}</p>
            <a class="video-link" href="${item.url}" target="_blank" rel="noopener noreferrer">Watch video</a>
          </div>
        `;

        gallery.appendChild(card);
      }
    });

    // If no supported cards were added
    if (gallery.innerHTML === "") {
      gallery.innerHTML = `
        <div class="placeholder">
          <div class="placeholder-icon">🌌</div>
          <p>No image or video entries found for this date range.</p>
        </div>
      `;
    }

  } catch (error) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>Something went wrong. Please try again.</p>
      </div>
    `;
    console.log(error);
  }
}