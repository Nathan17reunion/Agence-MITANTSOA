// ---------- Apparition progressive au scroll ----------
document.addEventListener('DOMContentLoaded', function () {
  var items = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && items.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    items.forEach(function (el) { observer.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }
});

// ---------- Suggestions d'adresse (Base Adresse Nationale, data.gouv.fr) ----------
const inputAdresse = document.getElementById('adresse');
const suggestionsBox = document.getElementById('adresse-suggestions');
const inputAdresseValidee = document.getElementById('adresse-validee');
const formDevis = inputAdresse?.closest('form');

let timeoutId = null;

if (inputAdresse) {
  inputAdresse.addEventListener('input', function () {
    const query = inputAdresse.value.trim();
    suggestionsBox.innerHTML = '';
    inputAdresseValidee.value = '';

    if (query.length < 3) {
      return;
    }

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      )
        .then((res) => res.json())
        .then((data) => {
          if (!data || !data.features || data.features.length === 0) {
            return;
          }

          data.features.forEach((feature) => {
            const label = feature.properties.label; // ex: "1 Rue Fernand Léger 14123 Ifs"
            const li = document.createElement('li');
            li.textContent = label;
            li.addEventListener('click', () => {
              inputAdresse.value = label;
              inputAdresseValidee.value = label;
              suggestionsBox.innerHTML = '';
            });
            suggestionsBox.appendChild(li);
          });
        })
        .catch(() => {});
    }, 400);
  });

  document.addEventListener('click', (e) => {
    if (e.target !== inputAdresse) {
      suggestionsBox.innerHTML = '';
    }
  });

  if (formDevis) {
    formDevis.addEventListener('submit', function (e) {
      if (!inputAdresseValidee.value.trim() && inputAdresse.value.trim()) {
        const continuer = confirm(
          "Votre adresse n'a pas été trouvée dans les suggestions. Voulez-vous quand même envoyer votre demande avec l'adresse telle que saisie ?"
        );
        if (!continuer) {
          e.preventDefault();
          inputAdresse.focus();
        }
      }
    });
  }
}

// ---------- Sélecteur de langue (Google Translate) ----------
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'fr',
    includedLanguages: 'fr,en,mg,de,it,es,zh,ko,ja',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    autoDisplay: false
  }, 'google_translate_element');
}

function changeLanguage(lang) {
  document.cookie = "googtrans=/fr/" + lang + "; path=/";
  document.cookie = "googtrans=/fr/" + lang + "; path=/; domain=." + location.hostname;
  window.location.reload();
}

document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('langToggleBtn');
  const menu = document.getElementById('langMenu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.lang-widget-fixed')) {
        menu.classList.remove('is-open');
      }
    });
  }
});

// ---------- Bandeau cookies ----------
document.addEventListener('DOMContentLoaded', function () {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const acceptBtn = document.getElementById('cookie-accept');
  const refuseBtn = document.getElementById('cookie-refuse');

  let consent = null;
  try {
    consent = localStorage.getItem('mitantsoa_cookie_consent');
  } catch (e) {}

  if (!consent) {
    banner.classList.add('is-visible');
  }

  function hideBanner() {
    banner.classList.remove('is-visible');
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function () {
      try { localStorage.setItem('mitantsoa_cookie_consent', 'accepted'); } catch (e) {}
      hideBanner();
    });
  }
  if (refuseBtn) {
    refuseBtn.addEventListener('click', function () {
      try { localStorage.setItem('mitantsoa_cookie_consent', 'refused'); } catch (e) {}
      hideBanner();
    });
  }
});

(function () {
  var frame = document.getElementById('mapFrame');
  var btn   = document.getElementById('mapFsBtn');
  if (!frame || !btn) return;

  var nativeFS = frame.requestFullscreen || frame.webkitRequestFullscreen;

  function isFull() {
    return document.fullscreenElement === frame ||
           document.webkitFullscreenElement === frame ||
           frame.classList.contains('is-fullscreen');
  }
  function refresh() {
    btn.textContent = isFull() ? '✕ Quitter' : '⛶ Plein écran';
  }
  function enter() {
    if (nativeFS) {
      (frame.requestFullscreen || frame.webkitRequestFullscreen).call(frame);
    } else {                                   // iPhone / Safari : mode "pseudo plein écran"
      frame.classList.add('is-fullscreen');
      document.body.style.overflow = 'hidden';
      refresh();
    }
  }
  function exit() {
    if (frame.classList.contains('is-fullscreen')) {
      frame.classList.remove('is-fullscreen');
      document.body.style.overflow = '';
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    }
    refresh();
  }

  btn.addEventListener('click', function () { isFull() ? exit() : enter(); });
  document.addEventListener('fullscreenchange', refresh);
  document.addEventListener('webkitfullscreenchange', refresh);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && frame.classList.contains('is-fullscreen')) exit();
  });
})();