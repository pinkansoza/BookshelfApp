document.addEventListener("DOMContentLoaded", () => {
    const bookForm = document.getElementById("bookForm");
    const incompleteBookList = document.getElementById("incompleteBookList");
    const completeBookList = document.getElementById("completeBookList");

    // Memuat buku dari Local Storage saat halaman dimuat
    loadBooksFromLocalStorage();

    // Menangani pengiriman formulir untuk menambah buku
    bookForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Mencegah pengiriman formulir secara default

        const title = document.getElementById("bookFormTitle").value;
        const author = document.getElementById("bookFormAuthor").value;
        const year = parseInt(document.getElementById("bookFormYear").value); // Pastikan tahun berupa angka
        const isComplete = document.getElementById("bookFormIsComplete").checked;

        // Membuat objek buku
        const book = {
            id: Date.now(), // Menggunakan timestamp sebagai ID unik
            title: title,
            author: author,
            year: year,
            isComplete: isComplete
        };

        // Validasi format objek buku
        if (validateBook(book)) {
            saveBookToLocalStorage(book); // Menyimpan buku ke Local Storage
            addBookToList(book); // Menambahkan buku ke daftar yang sesuai
            bookForm.reset(); // Reset formulir
        } else {
            console.error("Format buku tidak valid:", book);
            alert("Data buku tidak valid. Periksa kembali input Anda!");
        }
    });

    // Event delegation untuk menangani tombol di dalam daftar buku
    incompleteBookList.addEventListener("click", handleBookActions);
    completeBookList.addEventListener("click", handleBookActions);

    function handleBookActions(event) {
        const target = event.target;

        if (target.matches("[data-testid='bookItemDeleteButton']")) {
            // Menghapus buku
            const bookItem = target.closest("[data-testid='bookItem']");
            const bookId = bookItem.getAttribute("data-bookid");
            bookItem.remove();
            removeBookFromLocalStorage(bookId);
        } else if (target.matches("[data-testid='bookItemIsCompleteButton']")) {
            // Mengubah status buku
            const bookItem = target.closest("[data-testid='bookItem']"); 
            const bookId = bookItem.getAttribute("data-bookid");
            const isComplete = target.textContent === "Selesai dibaca" ? false : true; // Flip status isComplete

            // Memindahkan buku ke daftar yang sesuai dan mengubah status
            if (isComplete) {
                completeBookList.appendChild(bookItem);
                target.textContent = "Selesai dibaca";
            } else {
                incompleteBookList.appendChild(bookItem);
                target.textContent = "Belum selesai dibaca";
            }

            updateBookInLocalStorage(bookId, !isComplete); // negasi dari isComplete.
            loadBooksFromLocalStorage() // Panggil fungsi ini agar data buku diperbarui
        } else if (target.matches("[data-testid='bookItemEditButton']")) {
            // Mengedit buku
            const bookItem = target.closest("[data-testid='bookItem']");
            const title = bookItem.querySelector("[data-testid='bookItemTitle']").textContent;
            const author = bookItem.querySelector("[data-testid='bookItemAuthor']").textContent.replace("Penulis: ", "");
            const year = parseInt(bookItem.querySelector("[data-testid='bookItemYear']").textContent.replace("Tahun: ", ""));
            const bookId = bookItem.getAttribute("data-bookid");

            // Mengisi form dengan data buku yang ada
            document.getElementById("bookFormTitle").value = title;
            document.getElementById("bookFormAuthor").value = author;
            document.getElementById("bookFormYear").value = year;
            document.getElementById("bookFormIsComplete").checked = target.textContent === "Selesai dibaca";

            bookItem.remove();
            removeBookFromLocalStorage(bookId);
        }
    }

    function saveBookToLocalStorage(book) {
        const books = getBooksFromLocalStorage();
        books.push(book);
        localStorage.setItem("books", JSON.stringify(books));
    }

    function loadBooksFromLocalStorage() {
        incompleteBookList.innerHTML = ""; // Me-reset data buku yang ada di incompleteBookList
        completeBookList.innerHTML = ""; // Me-reset data buku yang ada di completeBookList
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

    function validateBook(book) {
        return (
            (typeof book.id === 'string' || typeof book.id === 'number') &&
            typeof book.title === 'string' &&
            typeof book.author === 'string' &&
            typeof book.year === 'number' &&
            typeof book.isComplete === 'boolean'
        );
    }
});