//blog page
const blogForm = document.getElementById('blogForm');
    const blogPosts = document.getElementById('blogPosts');

    blogForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const opinion = document.getElementById('opinion').value;
      const imageFile = document.getElementById('image').files[0];

      const reader = new FileReader();
      reader.onload = function () {
        const imgURL = reader.result;

        const card = document.createElement('div');
        card.className = 'bg-gray-900 bg-opacity-80 rounded shadow overflow-hidden text-white border border-gray-700';

        card.innerHTML = `
          <img src="${imgURL}" alt="${name}" class="w-full h-48 object-cover">
          <div class="p-4">
            <h4 class="text-lg font-bold mb-1">${name}</h4>
            <p class="text-sm text-gray-300">${opinion}</p>
          </div>
        `;

        blogPosts.prepend(card);
        blogForm.reset();
      };

      if (imageFile) {
        reader.readAsDataURL(imageFile);
      } else {
        alert("Please select an image!");
      }
    });

    //contact page
     document.getElementById('contactForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const toast = document.getElementById('toast');
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 3000);
    });
    
    //icon for signup and login