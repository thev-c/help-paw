document.getElementById('reportForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const formData = new FormData(this);
  
    // Get location
    navigator.geolocation.getCurrentPosition(async (position) => {
      formData.append('latitude', position.coords.latitude);
      formData.append('longitude', position.coords.longitude);
  
      const response = await fetch('/report', {
        method: 'POST',
        body: formData
      });
  
      const result = await response.json();
      alert(result.message);
      this.reset();
    }, (error) => {
      alert("Location access denied.");
    });
  });
  