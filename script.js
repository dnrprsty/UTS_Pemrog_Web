// js/script.js

// --- Utility Functions (Reusable) ---
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

const showPopup = (message) => {
    alert(message);
};
// js/script.js (TAMBAHKAN DI BAWAH UTILITY FUNCTIONS)

// --- Dark Mode Logic ---

const loadDarkModePreference = () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        // Update tombol toggle jika ada
        const modeToggle = document.getElementById('mode-toggle');
        if (modeToggle) modeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }
};

const toggleDarkMode = () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    const modeToggle = document.getElementById('mode-toggle');

    if (isDarkMode) {
        localStorage.setItem('darkMode', 'enabled');
        if (modeToggle) modeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        if (modeToggle) modeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
};

// ... (LANJUTKAN KE BAGIAN LAIN) ...
// ... (showModal dan hideModal tetap sama) ...
const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex'; 
    }
};

const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
};

// --- Perbaikan: Manajemen Data Terpusat (dari data.js) ---

// Inisialisasi data tracking default dari data.js
const defaultTracking = {
    "20230012": {
        nomorDO: "20230012", nama: "Rina Wulandari", status: "Dalam Perjalanan", ekspedisi: "JNE", tanggalKirim: "2025-08-25", paket: "0JKT01", total: 180000,
        perjalanan:[
            { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Toko Buku" },
            { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: TANGERANG SELATAN" },
            { waktu: "2025-08-26 10:12:20", keterangan: "Diteruskan ke Kantor Jakarta Selatan" },
        ]
    },
    "20230013": {
        nomorDO: "20230013", nama: "Agus Pranoto", status: "Telah Diterima", ekspedisi: "Pos Indonesia", tanggalKirim: "2025-08-25", paket: "0UPBJJBDG", total: 220000,
        perjalanan:[
            { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Toko Buku" },
            { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: TANGERANG SELATAN" },
            { waktu: "2025-08-25 16:30:10", keterangan: "Diteruskan ke Kantor Kota Bandung" },
            { waktu: "2025-08-26 12:15:33", keterangan: "Tiba di Hub: Kota BANDUNG" },
            { waktu: "2025-08-26 15:06:12", keterangan: "Proses antar ke Cimahi" },
            { waktu: "2025-08-26 20:00:00", keterangan: "Selesai Antar. Penerima: Agus Pranoto" }
        ]
    }
};


/**
 * Mendapatkan semua data transaksi (history + tracking) dari localStorage.
 * Jika belum ada, gunakan data default dari variabel awal.
 * Semua transaksi disimpan dalam array history.
 */
function getAllTransactions() {
    let history = localStorage.getItem('orderHistory');
    
    if (history) {
        return JSON.parse(history);
    } else {
        // Jika belum ada di localStorage, generate history dari dataTracking default
        const defaultHistory = Object.values(defaultTracking);
        // Simpan default ke localStorage untuk pemakaian berikutnya
        localStorage.setItem('orderHistory', JSON.stringify(defaultHistory));
        return defaultHistory;
    }
}

/**
 * Menyimpan array transaksi ke localStorage
 */
function saveTransactions(transactions) {
    localStorage.setItem('orderHistory', JSON.stringify(transactions));
}


// --- LOGIN/DAFTAR Logic (login.html) ---

// ... (handleLogin, handleDaftar, dan fungsi terkait lainnya tetap sama) ...
const handleLogin = (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    const users = getDataPengguna();

    const user = users.find(u => u.email === emailInput && u.password === passwordInput);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        showPopup("Email atau password yang Anda masukkan salah.");
    }
};

const handleDaftar = (e) => {
    e.preventDefault();
    const nama = document.getElementById('daftar-nama').value;
    const email = document.getElementById('daftar-email').value;
    const password = document.getElementById('daftar-password').value;
    
    if (!nama || !email || !password) {
        showPopup("Semua field pendaftaran harus diisi!");
        return;
    }

    let users = getDataPengguna();
    if (users.find(u => u.email === email)) {
        showPopup("Email sudah terdaftar. Silakan login atau gunakan email lain.");
        return;
    }

    const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
    const newUser = { id: newId, nama, email, password, role: "User" };
    users.push(newUser);

    localStorage.setItem('dataPengguna', JSON.stringify(users));
    
    hideModal('modal-daftar');
    showPopup("Pendaftaran berhasil! Silakan login.");

    document.getElementById('daftar-form').reset();
};


// --- DASHBOARD Logic (dashboard.html) ---

const setGreeting = () => {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) {
        greeting = "Selamat Pagi";
    } else if (hour < 18) {
        greeting = "Selamat Siang";
    } else {
        greeting = "Selamat Sore";
    }

    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'login.html'; // Redirect jika belum login
        return;
    }
    
    const greetingEl = document.getElementById('greeting-message');
    if (greetingEl) {
        greetingEl.textContent = `${greeting}, ${user.nama}! Anda login sebagai ${user.role}.`;
    }
    
    // Sembunyikan link Laporan jika bukan Admin
    const laporanLink = document.getElementById('laporan-link');
    if (laporanLink && user.role !== 'Admin') {
        laporanLink.style.display = 'none';
    }
};

const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
};

// --- STOK/KATALOG Logic (stok.html) ---

// ... (renderKatalog dan tambahStokBaru tetap sama) ...
const renderKatalog = () => {
    const tableBody = document.getElementById('katalog-body');
    if (!tableBody) return;

    tableBody.innerHTML = ''; 
    
    dataKatalogBuku.forEach((buku, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="kode-barang">${buku.kodeBarang}</td>
            <td><img src="${buku.cover}" alt="${buku.namaBarang}" class="book-cover"></td>
            <td>${buku.namaBarang}</td>
            <td>${buku.jenisBarang}</td>
            <td>${buku.edisi}</td>
            <td>${buku.stok}</td>
            <td>${formatRupiah(buku.harga)}</td>
        `;
    });
};

const tambahStokBaru = (e) => {
    e.preventDefault();
    const kode = document.getElementById('input-kode').value;
    const nama = document.getElementById('input-nama').value;
    const jenis = document.getElementById('input-jenis').value;
    const edisi = document.getElementById('input-edisi').value;
    const stok = parseInt(document.getElementById('input-stok').value);
    const harga = parseInt(document.getElementById('input-harga').value);
    const cover = 'img/default.jpg'; 

    if (!kode || !nama || !jenis || !edisi || isNaN(stok) || isNaN(harga)) {
        showPopup("Semua field harus diisi dengan benar!");
        return;
    }
    
    // Cek duplikat kode
    if (dataKatalogBuku.some(b => b.kodeBarang === kode)) {
         showPopup("Kode Barang sudah ada di katalog!");
        return;
    }

    const newBuku = { kodeBarang: kode, namaBarang: nama, jenisBarang: jenis, edisi: edisi, stok: stok, harga: harga, cover: cover };
    dataKatalogBuku.push(newBuku);
    
    // Perbarui tampilan tabel DOM
    const tableBody = document.getElementById('katalog-body');
    if (tableBody) {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${dataKatalogBuku.length}</td>
            <td class="kode-barang">${newBuku.kodeBarang}</td>
            <td><img src="${newBuku.cover}" alt="${newBuku.namaBarang}" class="book-cover"></td>
            <td>${newBuku.namaBarang}</td>
            <td>${newBuku.jenisBarang}</td>
            <td>${newBuku.edisi}</td>
            <td>${newBuku.stok}</td>
            <td>${formatRupiah(newBuku.harga)}</td>
        `;
    }
    
    hideModal('modal-tambah-stok');
    showPopup("Stok buku baru berhasil ditambahkan!");
    document.getElementById('form-tambah-stok').reset();
};


// --- CHECKOUT Logic (checkout.html) ---

let keranjang = []; // Keranjang belanja sementara

// ... (renderKeranjang dan tambahKeKeranjang, hapusDariKeranjang tetap sama) ...
const renderKeranjang = () => {
    const tableBody = document.getElementById('keranjang-body');
    const totalEl = document.getElementById('total-pembayaran');
    if (!tableBody || !totalEl) return;

    tableBody.innerHTML = '';
    let grandTotal = 0;

    keranjang.forEach((item, index) => {
        const total = item.harga * item.jumlah;
        grandTotal += total;
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.namaBarang}</td>
            <td>${item.jumlah}</td>
            <td>${formatRupiah(item.harga)}</td>
            <td>${formatRupiah(total)}</td>
            <td><button class="btn-sm btn-danger" onclick="hapusDariKeranjang(${index})">Hapus</button></td>
        `;
    });

    totalEl.textContent = formatRupiah(grandTotal);
};

const tambahKeKeranjang = () => {
    const kodeBuku = document.getElementById('kode-buku').value.toUpperCase();
    const jumlah = parseInt(document.getElementById('jumlah-pesan').value);

    const buku = dataKatalogBuku.find(b => b.kodeBarang === kodeBuku);
    
    if (!buku) {
        showPopup("Kode buku tidak ditemukan!");
        return;
    }
    if (isNaN(jumlah) || jumlah <= 0 || jumlah > buku.stok) {
        showPopup(`Jumlah pesanan tidak valid atau melebihi stok (${buku.stok})!`);
        return;
    }

    const itemKeranjang = { kodeBarang: buku.kodeBarang, namaBarang: buku.namaBarang, harga: buku.harga, jumlah: jumlah };
    
    const existingIndex = keranjang.findIndex(item => item.kodeBarang === kodeBuku);
    if (existingIndex > -1) {
        keranjang[existingIndex].jumlah += jumlah; 
    } else {
        keranjang.push(itemKeranjang);
    }
    
    renderKeranjang();
    showPopup(`"${buku.namaBarang}" sebanyak ${jumlah} buah ditambahkan ke keranjang.`);
    document.getElementById('form-tambah-keranjang').reset();
};

const hapusDariKeranjang = (index) => {
    keranjang.splice(index, 1);
    renderKeranjang();
};

const generateNextDO = (transactions) => {
    // Cari nomor DO terbesar
    const maxDO = transactions.reduce((max, t) => {
        const doNum = parseInt(t.nomorDO);
        return doNum > max ? doNum : max;
    }, 20230013); // Mulai dari DO terbesar di data default
    
    return (maxDO + 1).toString();
};


const prosesCheckout = (e) => {
    e.preventDefault();
    if (keranjang.length === 0) {
        showPopup("Keranjang belanja kosong! Silakan tambahkan buku.");
        return;
    }

    const namaPemesan = document.getElementById('pemesan-nama').value;
    const alamat = document.getElementById('pemesan-alamat').value;
    const metodeBayar = document.getElementById('metode-bayar').value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!namaPemesan || !alamat || !metodeBayar) {
        showPopup("Mohon lengkapi data pemesan dan pembayaran!");
        return;
    }

    const total = keranjang.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
    
    // Ambil data transaksi terbaru
    let transactions = getAllTransactions();

    // Generate Nomor Delivery Order Baru
    const nextDO = generateNextDO(transactions);

    const newOrder = {
        nomorDO: nextDO,
        nama: namaPemesan,
        email: currentUser ? currentUser.email : 'guest@example.com', // Sinkronisasi dengan user login
        status: "Menunggu Pengiriman",
        ekspedisi: "JNE", 
        tanggalKirim: new Date().toISOString().slice(0, 10),
        paket: "Reguler", 
        total: total,
        item: keranjang, 
        perjalanan: [{ waktu: new Date().toISOString().slice(0, 19).replace('T', ' '), keterangan: "Pesanan Diterima dan sedang diproses" }]
    };

    // Tambahkan ke array transaksi dan simpan ke localStorage (FIX)
    transactions.push(newOrder);
    saveTransactions(transactions);

    // Reset keranjang
    keranjang = [];
    renderKeranjang();

    showPopup(`Pesanan berhasil diproses! Nomor Delivery Order Anda: ${nextDO}. Total Pembayaran: ${formatRupiah(total)}. Silakan cek di menu Tracking Pengiriman.`);
    document.getElementById('form-checkout').reset();
};


// --- TRACKING Logic (tracking.html) ---

const cariTracking = (e) => {
    e.preventDefault();
    const nomorDO = document.getElementById('nomor-do').value.trim();
    const trackingDetail = document.getElementById('tracking-detail');
    trackingDetail.innerHTML = ''; 

    // Ambil data dari semua transaksi (FIX)
    const transactions = getAllTransactions();
    const data = transactions.find(t => t.nomorDO === nomorDO);

    if (!data) {
        trackingDetail.innerHTML = `<p class="alert-error">Nomor Delivery Order **${nomorDO}** tidak ditemukan.</p>`;
        return;
    }

    // ... (Logika Progress Bar dan tampilan detail tetap sama) ...
    let progressValue;
    let progressColor;

    switch (data.status) {
        case "Menunggu Pengiriman":
            progressValue = 25;
            progressColor = 'bg-primary';
            break;
        case "Dalam Perjalanan":
            progressValue = 75;
            progressColor = 'bg-warning';
            break;
        case "Dikirim": 
            progressValue = 90;
            progressColor = 'bg-info';
            break;
        case "Telah Diterima":
            progressValue = 100;
            progressColor = 'bg-success';
            break;
        default:
            progressValue = 0;
            progressColor = 'bg-secondary';
    }

    trackingDetail.innerHTML = `
        <article class="card detail-card">
            <h3>📦 Detail Pengiriman #${data.nomorDO}</h3>
            <p><strong>Nama Pemesan:</strong> ${data.nama}</p>
            <p><strong>Ekspedisi:</strong> ${data.ekspedisi}</p>
            <p><strong>Tanggal Kirim:</strong> ${data.tanggalKirim}</p>
            <p><strong>Jenis Paket:</strong> ${data.paket}</p>
            <p><strong>Total Pembayaran:</strong> ${formatRupiah(data.total)}</p>
        </article>

        <article class="card status-card">
            <h3>🚦 Status Pengiriman: ${data.status}</h3>
            <div class="progress-bar-container">
                <div class="progress-bar ${progressColor}" style="width: ${progressValue}%;">${progressValue}%</div>
            </div>
            <p class="status-info">Progres status: **${data.status}**</p>
        </article>

        <article class="card tracking-card">
            <h3>🗺️ Riwayat Perjalanan</h3>
            <ul class="timeline">
                ${data.perjalanan.map(log => `
                    <li class="${log.keterangan.includes('Selesai Antar') ? 'done' : ''}">
                        <time>${log.waktu}</time>
                        <p>${log.keterangan}</p>
                    </li>
                `).join('')}
            </ul>
        </article>
    `;
};


// --- HISTORY Logic (history.html) ---

const renderHistory = () => {
    const tableBody = document.getElementById('history-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    // Ambil data dari semua transaksi (FIX)
    const history = getAllTransactions();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let filteredHistory = history;

    // Filter history berdasarkan user yang login (kecuali Admin)
    if (currentUser && currentUser.role === 'User') {
        filteredHistory = history.filter(order => order.email === currentUser.email);
    }


    filteredHistory.sort((a, b) => new Date(b.tanggalKirim) - new Date(a.tanggalKirim));

    filteredHistory.forEach((order, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="nomor-do">${order.nomorDO}</td>
            <td>${order.tanggalKirim}</td>
            <td>${order.nama}</td>
            <td>${formatRupiah(order.total)}</td>
            <td><span class="status-${order.status.replace(/\s/g, '-').toLowerCase()}">${order.status}</span></td>
            <td><a href="tracking.html?do=${order.nomorDO}" class="btn-sm btn-info">Track</a></td>
        `;
    });
};

// --- LAPORAN Logic (laporan.html) ---
const renderLaporan = () => {
    const tableBody = document.getElementById('laporan-body');
    if (!tableBody) return;
    
    // Hanya Admin yang bisa mengakses laporan
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'Admin') {
        alert("Akses ditolak! Anda harus login sebagai Admin untuk melihat Laporan Pemesanan.");
        window.location.href = 'dashboard.html';
        return;
    }

    const transactions = getAllTransactions();
    tableBody.innerHTML = '';

    let totalPenjualan = 0;
    
    transactions.forEach((order, index) => {
        totalPenjualan += order.total;
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${order.nomorDO}</td>
            <td>${order.tanggalKirim}</td>
            <td>${order.nama}</td>
            <td>${order.item.length} Buku</td>
            <td>${formatRupiah(order.total)}</td>
            <td><span class="status-${order.status.replace(/\s/g, '-').toLowerCase()}">${order.status}</span></td>
        `;
    });

    // Tampilkan summary
    document.getElementById('total-transaksi').textContent = transactions.length;
    document.getElementById('total-revenue').textContent = formatRupiah(totalPenjualan);
};

// --- Event Listener Global ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // ... (Logika event listener untuk login, dashboard, stok, checkout, tracking tetap sama) ...
    // Login page
    if (path.endsWith('login.html') || path.endsWith('index.html')) {
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
        document.querySelectorAll('.modal-trigger').forEach(btn => {
            btn.addEventListener('click', () => showModal(btn.dataset.modal));
        });
        document.querySelectorAll('.modal .close-btn').forEach(btn => {
            btn.addEventListener('click', () => hideModal(btn.closest('.modal').id));
        });
        const daftarForm = document.getElementById('daftar-form');
        if (daftarForm) daftarForm.addEventListener('submit', handleDaftar);
    } 
    // Dashboard page
    else if (path.endsWith('dashboard.html')) {
        setGreeting();
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    } 
    // Stok page
    else if (path.endsWith('stok.html')) {
        renderKatalog();
        const formStok = document.getElementById('form-tambah-stok');
        if (formStok) formStok.addEventListener('submit', tambahStokBaru);
        document.getElementById('tambah-stok-btn').addEventListener('click', () => showModal('modal-tambah-stok'));
        document.querySelectorAll('.modal .close-btn').forEach(btn => {
            btn.addEventListener('click', () => hideModal(btn.closest('.modal').id));
        });
    }
    // Checkout page
    else if (path.endsWith('checkout.html')) {
        renderKeranjang();
        const formKeranjang = document.getElementById('form-tambah-keranjang');
        if (formKeranjang) formKeranjang.addEventListener('submit', (e) => { e.preventDefault(); tambahKeKeranjang(); });
        
        const formCheckout = document.getElementById('form-checkout');
        if (formCheckout) formCheckout.addEventListener('submit', prosesCheckout);
    }
    // Tracking page
    else if (path.endsWith('tracking.html')) {
        const formTracking = document.getElementById('form-tracking');
        if (formTracking) formTracking.addEventListener('submit', cariTracking);

        const urlParams = new URLSearchParams(window.location.search);
        const doParam = urlParams.get('do');
        if (doParam) {
            document.getElementById('nomor-do').value = doParam;
            cariTracking({ preventDefault: () => {} }); 
        }
    }
    // History page
    else if (path.endsWith('history.html')) {
        renderHistory();
    }
    // Laporan page (FIX)
    else if (path.endsWith('laporan.html')) {
        renderLaporan();
    }
});