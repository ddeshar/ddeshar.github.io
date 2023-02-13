const audio = (() => {
    let instance;

    let getInstance = function () {
        if (!instance) {
            let url = document.getElementById('tombol-musik').getAttribute('data-url').toString();
            instance = new Audio(url);
        }

        return instance;
    };

    return {
        play: function () {
            getInstance().play();
        },
        pause: function () {
            getInstance().pause();
        }
    };
})();

const salin = (btn) => {
    navigator.clipboard.writeText(btn.getAttribute('data-nomer').toString());
    btn.innerHTML = 'Tersalin';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = 'Salin No. Rekening';
        btn.disabled = false;
    }, 1500);
};

const timer = () => {
    let tanggal = document.getElementById('tampilan-waktu').getAttribute('data-waktu').toString();
    let countDownDate = new Date(tanggal).getTime();
    let time = null;

    time = setInterval(() => {
        let now = new Date().getTime();
        let distance = Math.max(countDownDate - now, 0);

        if (distance === 0) {
            clearInterval(time);
            return false;
        } else {
            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('hari').innerText = days;
            document.getElementById('jam').innerText = hours;
            document.getElementById('menit').innerText = minutes;
            document.getElementById('detik').innerText = seconds;
        }
    }, 1000);
};


const buka = () => {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('tombol-musik').style.display = 'block';
    AOS.init();
    login();
    audio.play();
};

const play = (btn) => {
    let isPlay = btn.getAttribute('data-status').toString() == 'true';

    if (!isPlay) {
        btn.setAttribute('data-status', 'true');
        audio.play();
        btn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
    } else {
        btn.setAttribute('data-status', 'false');
        audio.pause();
        btn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    }
};

const renderCard = (data) => {
    const DIV = document.createElement('div');
    DIV.classList.add('mb-3');
    DIV.innerHTML = `
    <div class="card-body bg-light shadow p-2 m-0 rounded-3">
        <div class="d-flex flex-wrap justify-content-between align-items-center">
            <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                <strong class="me-1 font-kanit">${data.nama}</strong>${data.hadir ? '<i class="fa-solid fa-circle-check text-success"></i>' : '<i class="fa-solid fa-circle-xmark text-danger"></i>'}
            </p>
            <!-- <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${data.created_at}</small> -->
        </div>
        <hr class="text-dark mt-1 mb-2">
        <p class="text-dark mt-1 mb-0 mx-0 p-0 font-BaiJamjuree" style="white-space: pre-line">${data.komentar}</p>
    </div>`;
    return DIV;
};

const ucapan = async () => {
    const UCAPAN = document.getElementById('daftarucapan');
    UCAPAN.innerHTML = `<div class="text-center"><span class="spinner-border spinner-border-sm me-1"></span>Loading...</div>`;
    let token = localStorage.getItem('token') ?? '';

    if (token.length == 0) {
        alert('เกิดข้อผิดพลาด โทเค็นว่างเปล่า !');
        window.location.reload();
        return;
    }

    const REQ = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };

    await fetch('https://abw-api.vercel.app/api/comment', REQ)
        .then((res) => res.json())
        .then((res) => {
            if (res.code == 200) {
                UCAPAN.innerHTML = null;
                res.data.forEach((data) => UCAPAN.appendChild(renderCard(data)));

                if (res.data.length == 0) {
                    UCAPAN.innerHTML = `<div class="h6 text-center">Tidak ada data</div>`;
                }
            }
        })
        .catch((err) => alert(err));
};

const login = async () => {
    const UCAPAN = document.getElementById('daftarucapan');
    UCAPAN.innerHTML = `<div class="text-center"><span class="spinner-border spinner-border-sm me-1"></span>Loading...</div>`;
    let body = document.querySelector('body');

    const REQ = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: body.getAttribute('data-email').toString(),
            password: body.getAttribute('data-password').toString()
        })
    };

    await fetch('https://abw-api.vercel.app/api/login', REQ)
        .then((res) => res.json())
        .then((res) => {
            if (res.code == 200) {
                localStorage.removeItem('token');
                localStorage.setItem('token', res.data.token);
                ucapan();
            }

            if (res.error.length != 0) {
                alert('มีข้อผิดพลาด, ' + res.error[0]);
                window.location.reload();
                return;
            }
        })
        // .catch(() => {
        //     alert('หากมีข้อผิดพลาด หน้าจะโหลดใหม่โดยอัตโนมัติ');
        //     window.location.reload();
        //     return;
        // });
};

const kirim = async () => {
    let nama = document.getElementById('formnama').value;
    let hadir = document.getElementById('hadiran').value;
    let komentar = document.getElementById('formpesan').value;
    let token = localStorage.getItem('token') ?? '';

    if (token.length == 0) {
        alert('เกิดข้อผิดพลาด โทเค็นว่างเปล่า !');
        window.location.reload();
        return;
    }

    if (nama.length == 0) {
        alert('ชื่อต้องไม่ว่างเปล่า');
        return;
    }

    if (nama.length >= 35) {
        alert('Maximum name length is 35');
        return;
    }

    if (hadir == 0) {
        alert('กรุณาเลือกการเข้าร่วม');
        return;
    }

    if (komentar.length == 0) {
        alert('ข้อความต้องไม่ว่างเปล่า');
        return;
    }

    document.getElementById('kirim').disabled = true;
    document.getElementById('kirim').innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

    const REQ = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            nama: nama,
            hadir: hadir == 1,
            komentar: komentar
        })
    };

    await fetch('https://abw-api.vercel.app/api/comment', REQ)
        .then((res) => res.json())
        .then((res) => {
            if (res.code == 201) {
                document.getElementById('formnama').value = null;
                document.getElementById('hadiran').value = 0;
                document.getElementById('formpesan').value = null;
                ucapan();
            }

            if (res.error.length != 0) {
                if (res.error[0] == 'Expired token') {
                    alert('มีข้อผิดพลาด โทเค็นหมดอายุแล้ว!');
                    window.location.reload();
                    return;
                }

                alert(res.error[0]);
            }
        })
        .catch((err) => alert(err));

    document.getElementById('kirim').disabled = false;
    document.getElementById('kirim').innerHTML = `Kirim<i class="fa-solid fa-paper-plane ms-1"></i>`;
};

document.addEventListener('DOMContentLoaded', () => {
    let modal = new bootstrap.Modal('#exampleModal');
    modal.show();
    timer();
});
