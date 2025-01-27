document.addEventListener("DOMContentLoaded", () => {
    const bookForm = document.getElementById("bookForm");
    const incompleteBookList = document.getElementById("incompleteBookList");
    const completeBookList = document.getElementById("completeBookList");

    // Memuat buku dari Local Storage saat halaman dimuat
    loadBooksFromLocalStorage();

    // Menangani pengiriman formulir untuk menambah buku
    bookForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = document.getElementById("bookFormTitle").value.trim();
        const author = document.getElementById("bookFormAuthor").value.trim();
        const year = parseInt(document.getElementById("bookFormYear").value);
        const isComplete = document.querySelector('input[name="isComplete"]:checked');

        // Validasi input
        if (!title || !author || isNaN(year) || !isComplete) {
            alert("Mohon isi semua data buku dengan benar dan pilih status baca.");
            return;
        }

        // Membuat objek buku
        const book = {
            id: Date.now(),
            title: title,
            author: author,
            year: year,
            isComplete: isComplete.value === "true"
        };

        // Simpan dan tambahkan buku ke daftar
        saveBookToLocalStorage(book);
        addBookToList(book);
        bookForm.reset();
    });

    // Event delegation untuk menangani tombol di dalam daftar buku
    document.addEventListener("click", (event) => {
        if (event.target.matches("[data-testid='bookItemDeleteButton']")) {
            handleDelete(event);
        } else if (event.target.matches("[data-testid='bookItemIsCompleteButton']")) {
            handleToggleComplete(event);
        } else if (event.target.matches("[data-testid='bookItemEditButton']")) {
            handleEdit(event);
        }
    });

    function handleDelete(event) {
        const bookItem = event.target.closest("[data-testid='bookItem']");
        const bookId = bookItem.getAttribute("data-bookid");
        bookItem.remove();
        removeBookFromLocalStorage(bookId);
    }

    function handleToggleComplete(event) {
        const bookItem = event.target.closest("[data-testid='bookItem']");
        const bookId = bookItem.getAttribute("data-bookid");
        const isComplete = bookItem.parentElement === completeBookList;

        // Pindahkan buku ke daftar yang sesuai
        if (isComplete) {
            incompleteBookList.appendChild(bookItem);
            event.target.textContent = "Selesai dibaca";
        } else {
            completeBookList.appendChild(bookItem);
            event.target.textContent = "Belum selesai dibaca";
        }

        // Perbarui status di Local Storage
        updateBookInLocalStorage(bookId, !isComplete);
    }

    function handleEdit(event) {
        const bookItem = event.target.closest("[data-testid='bookItem']");
        const bookId = bookItem.getAttribute("data-bookid");
        const title = bookItem.querySelector("[data-testid='bookItemTitle']").textContent;
        const author = bookItem.querySelector("[data-testid='bookItemAuthor']").textContent.replace("Penulis: ", "");
        const year = parseInt(bookItem.querySelector("[data-testid='bookItemYear']").textContent.replace("Tahun: ", ""));
        const isComplete = bookItem.parentElement === completeBookList;

        // Isi form dengan data buku
        document.getElementById("bookFormTitle").value = title;
        document.getElementById("bookFormAuthor").value = author;
        document.getElementById("bookFormYear").value = year;
        document.querySelector(`input[name="isComplete"][value="${isComplete}"]`).checked = true;

        // Hapus buku lama
        bookItem.remove();
        removeBookFromLocalStorage(bookId);
    }

    function saveBookToLocalStorage(book) {
        const books = getBooksFromLocalStorage();
        books.push(book);
        localStorage.setItem("books", JSON.stringify(books));
    }

    function loadBooksFromLocalStorage() {
        incompleteBookList.innerHTML = "";
        completeBookList.innerHTML = "";
        const books = getBooksFromLocalStorage();
        books.forEach(book => addBookToList(book));
    }

    function getBooksFromLocalStorage() {
        const books = localStorage.getItem("books");
        return books ? JSON.parse(books) : [];
    }

    function removeBookFromLocalStorage(bookId) {
        const books = getBooksFromLocalStorage();
        const updatedBooks = books.filter(book => book.id !== parseInt(bookId));
        localStorage.setItem("books", JSON.stringify(updatedBooks));
    }

    function updateBookInLocalStorage(bookId, isComplete) {
        const books = getBooksFromLocalStorage();
        const updatedBooks = books.map(book => {
            if (book.id === parseInt(bookId)) {
                return { ...book, isComplete: isComplete };
            }
            return book;
        });
        localStorage.setItem("books", JSON.stringify(updatedBooks));
    }

    function addBookToList(book) {
        const bookItem = document.createElement("div");
        bookItem.setAttribute("data-testid", "bookItem");
        bookItem.setAttribute("data-bookid", book.id);
        bookItem.innerHTML = `
            <h3 data-testid="bookItemTitle">${book.title}</h3>
            <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
            <p data-testid="bookItemYear">Tahun: ${book.year}</p>
            <div>
                <button data-testid="bookItemIsCompleteButton">${book.isComplete ? "Belum selesai dibaca" : "Selesai dibaca"}</button>
                <button data-testid="bookItemEditButton">Edit</button>
                <button data-testid="bookItemDeleteButton">Hapus</button>
            </div>
        `;

        if (book.isComplete) {
            completeBookList.appendChild(bookItem);
        } else {
            incompleteBookList.appendChild(bookItem);
        }
    }
});
