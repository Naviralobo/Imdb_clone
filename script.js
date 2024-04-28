//if local storage contains your favorite movies, fetch it else create one
const favoriteMovies = localStorage.getItem("favorites");
let parsedFavoriteMovies = [];

if (favoriteMovies) {
  parsedFavoriteMovies = JSON.parse(favoriteMovies);
} else {
  localStorage.setItem("favorites", JSON.stringify(parsedFavoriteMovies));
}

const searchInput = document.getElementById("searchInput");
const searcResults = document.getElementById("searchResults");
const favoritesBtn = document.getElementById("favoritesBtn");

//home page functionalities
function debounce(func, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(func, delay);
  };
}

async function searchMovies() {
  const query = searchInput.value;
  if (query === "") {
    searchInput.innerHTML = "";
    return;
  }
  try {
    const response = await fetch(
      ` http://www.omdbapi.com/?i=tt3896198&apikey=6d7b886b&type=movie&s=${query}`
    );
    const data = await response.json();
    if (data.Search) {
      displaySearchResults(data.Search);
    } else {
      searcResults.innerHTML = `<p>No results found</p>`;
    }
  } catch (err) {
    console.log(err);
  }
}

function displaySearchResults(movies) {
  searcResults.innerHTML = "";
  const ul = document.createElement("ul");
  movies.forEach((movie) => {
    const li = document.createElement("li");

    const titleLink = document.createElement("a");
    titleLink.textContent = movie.Title;
    titleLink.href = `movie.html?id=${movie.imdbID}`;

    const favoritesIcon = createFavoritesIcon(movie);
    if (parsedFavoriteMovies.some((item) => item.imdbID === movie.imdbID)) {
      favoritesIcon.style.color = "red";
    }
    li.appendChild(titleLink);

    li.appendChild(favoritesIcon);
    ul.appendChild(li);
  });
  searcResults.appendChild(ul);
}

function createFavoritesIcon(movie) {
  const favoritesIcon = document.createElement("i");
  favoritesIcon.classList.add("fa", "fa-heart");
  favoritesIcon.style.color = "white";
  favoritesIcon.style.marginRight = "5px";

  favoritesIcon.addEventListener("click", (e) =>
    // favorite icon either adds when first clicked and removes from list when clicked again
    addOrRemoveFavorite(favoritesIcon, movie, e)
  );

  return favoritesIcon;
}

function addOrRemoveFavorite(favoritesIcon, movie, e) {
  e?.preventDefault();
  e?.stopPropagation();
  const isAlreadyFavorite = parsedFavoriteMovies?.some(
    (item) => item.imdbID === movie.imdbID
  );

  if (isAlreadyFavorite) {
    favoritesIcon.style.color = "white";
    removeFromFavorites(movie);
  } else {
    favoritesIcon.style.color = "red";
    addToFavorites(movie);
  }
}

function addToFavorites(movie) {
  parsedFavoriteMovies.push(movie);
  localStorage.setItem("favorites", JSON.stringify(parsedFavoriteMovies));
}
function removeFromFavorites(movie) {
  const movieIndex = parsedFavoriteMovies.findIndex(
    (item) => item.imdbID === movie.imdbID
  );
  parsedFavoriteMovies.splice(movieIndex, 1);
  localStorage.setItem("favorites", JSON.stringify(parsedFavoriteMovies));
}

//movie page functions
async function displaySelectedMovieDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const imdbID = urlParams.get("id");
  const movie = await getSelectedMovie(imdbID);

  const title = document.getElementById("movieTitle");
  title.innerHTML = `<div>${movie.Title}</div> <div>( ${movie.Year} )</div`;

  const poster = document.getElementById("poster");
  poster.src = movie.Poster;

  const plot = document.getElementById("plot");
  plot.textContent = movie.Plot;
}

async function getSelectedMovie(imdbID) {
  try {
    const response = await fetch(
      `http://www.omdbapi.com/?i=${imdbID}&apikey=6d7b886b`
    );
    const data = await response.json();
    return data;
  } catch (err) {
    alert(err);
  }
}

//favourites page
function displayFavorites() {
  const favoritesList = document.getElementById("favoritesList");
  favoritesList.innerHTML = "";
  if (parsedFavoriteMovies && parsedFavoriteMovies.length > 0) {
    const ul = document.createElement("ul");

    parsedFavoriteMovies.forEach((movie) => {
      const li = document.createElement("li");
      li.textContent = movie.Title;

      const deleteBtn = createDeleteBtn(movie);
      li.appendChild(deleteBtn);

      ul.appendChild(li);
    });
    favoritesList.appendChild(ul);
  } else {
    favoritesList.innerHTML = `<p style="color:gray">There are no favorite movies in your list</p>`;
  }
}

function createDeleteBtn(movie) {
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "x";
  deleteBtn.classList.add("deleteBtn");

  deleteBtn.addEventListener("click", () => {
    removeFromFavorites(movie);
    displayFavorites();
  });
  return deleteBtn;
}

//event-listeners

if (searchInput) {
  searchInput.addEventListener("input", debounce(searchMovies, 300));
}

if (favoritesBtn) {
  favoritesBtn.addEventListener("click", navigateToFavoritesPage);
}
const backBtn = document.getElementById("backBtn");

if (backBtn) {
  backBtn.addEventListener("click", navigateToHomePage);
}

document.addEventListener("DOMContentLoaded", displaySelectedMovieDetails);
document.addEventListener("DOMContentLoaded", displayFavorites);

//navigations
function navigateToHomePage() {
  window.location.href = "index.html";
}

function navigateToFavoritesPage() {
  window.location.href = "favorites.html";
}
