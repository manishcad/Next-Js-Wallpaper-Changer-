//const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=10&page=1`;

//const query = "mountains";
const fetchImages = async () => {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=Space&per_page=10`,
      {
        headers: {
          Authorization: `Client-ID ${`fFwxrsqBnHPSc0h864_bHBxkXvEMljox7toU5TUWcIs`}`
        }
      }
    );
    const data = await res.json();
    console.log(data)
    return data.results;
  };

fetchImages()