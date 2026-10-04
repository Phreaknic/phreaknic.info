(function () {
  'use strict';

  var navLinks = document.querySelectorAll('.nav-link[data-view]');
  var views = document.querySelectorAll('.view');
  var timestampEl = document.querySelector('.timestamp');
  var countdownEl = document.getElementById('countdown');
  var sidebar = document.getElementById('site-sidebar');
  var sidebarToggle = document.querySelector('.sidebar-toggle');
  var infoToggle = document.querySelector('.info-toggle');
  var eventInfoPanel = document.getElementById('event-info-panel');
  var eventDate = new Date('2026-11-06T09:30:00-06:00').getTime();

  var speakers = [];
  var topics = [];

  function pushRouteHash(hash, state) {
    history.pushState(state || null, '', window.location.pathname + window.location.search + hash);
  }

  // ===== DATA LOADING =====
  function loadData() {
    return Promise.all([
      fetch('api/v1/speakers.json?v=pn27-withdrawal').then(function (res) {
        if (!res.ok) throw new Error('Failed to load api/v1/speakers.json: ' + res.status);
        return res.json();
      }),
      fetch('api/v1/topics.json?v=pn27-withdrawal').then(function (res) {
        if (!res.ok) throw new Error('Failed to load api/v1/topics.json: ' + res.status);
        return res.json();
      })
    ]).then(function (results) {
      speakers = results[0];
      topics = results[1];
      renderSpeakerProfiles(speakers);
      renderSchedule(topics, speakers);
    }).catch(function (err) {
      console.error(err);
      document.getElementById('schedule-container').textContent = 'The schedule could not be loaded. Please refresh to try again.';
      document.getElementById('speakers-grid').textContent = 'The speakers could not be loaded. Please refresh to try again.';
    });
  }

  // ===== SPEAKERS =====
  function renderSpeakerProfiles(data) {
    var grid = document.getElementById('speakers-grid');
    if (!grid) return;

    grid.innerHTML = '';

    data.forEach(function (speaker) {
      var card = document.createElement('article');
      card.className = 'speaker-profile';
      card.id = speaker.id;
      card.setAttribute('data-speaker', speaker.id);
      card.innerHTML =
        '<header class="speaker-heading">' +
        '<h2 class="speaker-name"><a data-speaker-preview="' + escapeHtml(speaker.id) + '" href="speakers/#speakers/' + encodeURIComponent(speaker.id) + '">' + escapeHtml(speaker.name) + '</a></h2>' +
        '<p class="speaker-topic">' + escapeHtml(speaker.topic) + '</p></header>' +
        '<div class="speaker-bio">' + speaker.bio.map(function (p) { return '<p>' + escapeHtml(p) + '</p>'; }).join('') + '</div>';
      grid.appendChild(card);
    });
  }

  // ===== SCHEDULE =====
  function escapeHtml(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatTime(value) {
    var parts = value.split(':');
    var hour = Number(parts[0]);
    return (hour % 12 || 12) + ':' + parts[1] + (hour < 12 ? ' AM' : ' PM');
  }

  function topicTime(topic) {
    return formatTime(topic.time) + (topic.end_time ? '–' + formatTime(topic.end_time) : '');
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr + 'T00:00:00Z');
    var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return days[d.getUTCDay()] + ' — ' + months[d.getUTCMonth()] + ' ' + String(d.getUTCDate()).padStart(2, '0') + ', ' + d.getUTCFullYear();
  }

  function renderSchedule(data, speakerData) {
    var container = document.getElementById('schedule-container');
    if (!container) return;

    container.innerHTML = '';

    // Group by date
    var dateGroups = {};
    data.forEach(function (topic) {
      var date = topic.date || '';
      if (!dateGroups[date]) dateGroups[date] = [];
      dateGroups[date].push(topic);
    });

    // Sort dates chronologically
    var sortedDates = Object.keys(dateGroups).sort();

    sortedDates.forEach(function (date) {
      var dayDiv = document.createElement('div');
      dayDiv.className = 'schedule-day';

      var dayHeader = document.createElement('h2');
      dayHeader.className = 'day-header';
      dayHeader.textContent = formatDate(date);
      dayDiv.appendChild(dayHeader);

      var table = document.createElement('table');
      table.className = 'schedule-table';
      table.innerHTML =
        '<thead>' +
          '<tr>' +
            '<th>TIME</th>' +
            '<th>TALK</th>' +
            '<th>SPEAKER</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody></tbody>';

      var tbody = table.querySelector('tbody');

      // Sort by time within the day
      var dayTopics = dateGroups[date].sort(function (a, b) { return a.time.localeCompare(b.time); });

      dayTopics.forEach(function (topic) {
        var row = document.createElement('tr');
        row.setAttribute('data-topic', topic.id);

        if (topic.description) {
          row.classList.add('topic-clickable');
        } else {
          row.classList.add('topic-dim');
        }

        var timeCell = document.createElement('td');
        timeCell.className = 'time-cell';
        timeCell.textContent = topicTime(topic);

        var talkCell = document.createElement('td');
        talkCell.className = 'talk-cell';
        if (topic.description) {
          var titleLink = document.createElement('a');
          titleLink.href = '#topics/' + topic.id;
          titleLink.textContent = topic.title;
          titleLink.className = 'talk-link';
          talkCell.appendChild(titleLink);
        } else {
          talkCell.textContent = topic.title;
        }

        var roomCell = document.createElement('td');
        roomCell.className = 'schedule-speakers';
        topic.speaker_ids.forEach(function (id, index) {
          var speaker = speakerData.find(function (item) { return item.id === id; });
          if (!speaker) return;
          if (index) roomCell.appendChild(document.createTextNode(', '));
          var link = document.createElement('a');
          link.href = 'speakers/#speakers/' + encodeURIComponent(id);
          link.setAttribute('data-speaker-preview', id);
          link.textContent = speaker.name;
          roomCell.appendChild(link);
        });

        row.appendChild(timeCell);
        row.appendChild(talkCell);
        row.appendChild(roomCell);
        tbody.appendChild(row);
      });

      var tableWrap = document.createElement('div');
      tableWrap.className = 'schedule-table-wrap';
      tableWrap.appendChild(table);
      dayDiv.appendChild(tableWrap);
      container.appendChild(dayDiv);
    });
  }

  // ===== VIEW SWITCHING =====
  function switchView(viewName) {
    var currentView = document.querySelector('.view.active');
    var isNewView = !currentView || currentView.id !== 'view-' + viewName;
    navLinks.forEach(function (link) {
      var isActive = false;
      if (viewName === 'speaker-detail') {
        isActive = link.getAttribute('data-view') === 'speakers';
      } else {
        isActive = link.getAttribute('data-view') === viewName;
      }
      link.classList.toggle('active', isActive);
    });

    views.forEach(function (view) {
      view.classList.toggle('active', view.id === 'view-' + viewName);
    });

    if (isNewView) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (this.getAttribute('data-view') === 'schedule' || this.getAttribute('data-view') === 'speakers') return;
      e.preventDefault();
      switchView(this.getAttribute('data-view'));
      pushRouteHash('#' + this.getAttribute('data-view'));
      if (window.innerWidth <= 768) {
        setSidebarExpanded(false);
      }
    });
  });

  function setSidebarExpanded(isExpanded) {
    if (!sidebar || !sidebarToggle) return;

    sidebar.classList.toggle('is-expanded', isExpanded);
    sidebarToggle.textContent = isExpanded ? '×' : '☰';
    sidebarToggle.setAttribute('aria-expanded', String(isExpanded));
    sidebarToggle.setAttribute('aria-label', isExpanded ? 'Close navigation menu' : 'Open navigation menu');

    if (infoToggle) {
      infoToggle.setAttribute('aria-expanded', String(isExpanded));
    }

    if (eventInfoPanel) {
      eventInfoPanel.setAttribute('aria-hidden', window.innerWidth <= 768 ? String(!isExpanded) : 'false');
    }
  }

  if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      setSidebarExpanded(!sidebar.classList.contains('is-expanded'));
    });
  }

  if (sidebar && infoToggle) {
    infoToggle.addEventListener('click', function () {
      setSidebarExpanded(!sidebar.classList.contains('is-expanded'));
    });
  }

  document.addEventListener('click', function (e) {
    if (
      window.innerWidth <= 768 &&
      sidebar &&
      sidebar.classList.contains('is-expanded') &&
      !sidebar.contains(e.target)
    ) {
      setSidebarExpanded(false);
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      setSidebarExpanded(false);
    }
  });

  setSidebarExpanded(false);

  // ===== SPEAKER DETAIL (modal) =====
  var modalOverlay = document.getElementById('speaker-modal');
  var modalName = document.getElementById('modal-name');
  var modalTopic = document.getElementById('modal-topic');
  var modalBio = document.getElementById('modal-bio');
  var modalAvatar = document.getElementById('modal-avatar-placeholder');
  var modalTwitter = document.getElementById('modal-twitter');
  var modalGithub = document.getElementById('modal-github');
  var modalWebsite = document.getElementById('modal-website');
  var modalClose = modalOverlay.querySelector('.modal-close');

  var lastHashBeforeModal = '';
  var speakerModalTrigger = null;

  function speakerBackgroundView() {
    return (history.state && history.state.speakerView) || (/\/schedule(?:\/index\.html|\/)?$/.test(window.location.pathname) ? 'schedule' : 'speakers');
  }

  function findSpeaker(id) {
    return speakers.find(function (s) { return s.id === id; });
  }

  function openSpeakerModal(speakerId) {
    var speaker = findSpeaker(speakerId);
    if (!speaker) return;

    var activeView = document.querySelector('.view.active');
    var backgroundView = activeView ? activeView.id.replace('view-', '') : speakerBackgroundView();
    lastHashBeforeModal = window.location.hash.indexOf('#speakers/') === 0 ? '#' + backgroundView : (window.location.hash || '#' + backgroundView);

    modalName.textContent = speaker.name;
    modalTopic.textContent = speaker.topic;
    modalAvatar.textContent = speaker.initials;
    modalBio.innerHTML = speaker.bio.map(function (p) { return '<p>' + escapeHtml(p) + '</p>'; }).join('');

    [ [modalTwitter, speaker.twitter], [modalGithub, speaker.github], [modalWebsite, speaker.website] ].forEach(function (item) {
      item[0].hidden = !item[1];
      if (item[1]) item[0].href = item[1];
      else item[0].removeAttribute('href');
    });

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.location.hash !== '#speakers/' + speakerId) pushRouteHash('#speakers/' + speakerId, { speakerView: backgroundView });
    modalClose.focus({ preventScroll: true });
  }

  function closeSpeakerModal(restoreRoute) {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (lastHashBeforeModal && restoreRoute !== false) {
      pushRouteHash(lastHashBeforeModal);
      lastHashBeforeModal = '';
    }
    lastHashBeforeModal = '';
    if (restoreRoute !== false && speakerModalTrigger) speakerModalTrigger.focus({ preventScroll: true });
    speakerModalTrigger = null;
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[data-speaker-preview]');
    if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault();
      speakerModalTrigger = link;
      openSpeakerModal(link.getAttribute('data-speaker-preview'));
    }
  });

  modalClose.addEventListener('click', closeSpeakerModal);

  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) {
      closeSpeakerModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeSpeakerModal();
    }
  });

  // ===== TOPIC MODAL =====
  var topicModalOverlay = document.getElementById('topic-modal');
  var topicModalName = document.getElementById('topic-modal-name');
  var topicModalTopic = document.getElementById('topic-modal-topic');
  var topicModalDesc = document.getElementById('topic-modal-desc');
  var topicModalRoom = document.getElementById('topic-modal-room');
  var topicModalTime = document.getElementById('topic-modal-time');
  var topicModalClose = document.querySelector('.topic-modal-close');
  var topicModalBody = document.getElementById('topic-modal-body');
  var topicModalSocial = document.getElementById('topic-modal-social');
  var topicModalDivider = document.getElementById('topic-modal-divider');

  var lastHashBeforeTopicModal = '';

  function findTopic(id) {
    return topics.find(function (t) { return t.id === id; });
  }

  function openTopicModal(topicId) {
    var topic = findTopic(topicId);
    if (!topic) return;

    lastHashBeforeTopicModal = window.location.hash.indexOf('#topics/') === 0 ? '#schedule' : (window.location.hash || '#schedule');

    topicModalName.textContent = topic.title;
    topicModalTopic.textContent = topic.speaker_ids.map(function (id) { return findSpeaker(id).name; }).join(', ');
    topicModalTime.textContent = formatDate(topic.date) + ' · ' + topicTime(topic);
    topicModalDesc.innerHTML = topic.description
      ? topic.description
      : '<p class="no-description">No description available.</p>';


    topicModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.location.hash !== '#topics/' + topicId) pushRouteHash('#topics/' + topicId);
    topicModalClose.focus({ preventScroll: true });
  }

  function closeTopicModal(restoreRoute) {
    topicModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (lastHashBeforeTopicModal && restoreRoute !== false) {
      pushRouteHash(lastHashBeforeTopicModal);
      lastHashBeforeTopicModal = '';
    }
    lastHashBeforeTopicModal = '';
  }

  // Click handlers for schedule rows and speaker-card links within topic modal
  document.addEventListener('click', function (e) {
    var topicRow = e.target.closest('tr[data-topic]');
    if (topicRow && !e.target.closest('a')) {
      var topicId = topicRow.getAttribute('data-topic');
      var topic = findTopic(topicId);
      if (topic && topic.description) {
        openTopicModal(topicId);
      }
    }

    var link = e.target.closest('a[href^="#topics/"]');
    if (link) {
      e.preventDefault();
      var speakerId = link.getAttribute('href').replace('#topics/', '');
      pushRouteHash('#topics/' + speakerId);
      navigateTo({ view: 'topic-detail', topic: speakerId });
    }
  });

  topicModalClose.addEventListener('click', closeTopicModal);

  topicModalOverlay.addEventListener('click', function (e) {
    if (e.target === topicModalOverlay) {
      closeTopicModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && topicModalOverlay.classList.contains('active')) {
      closeTopicModal();
    }
  });

  // ===== ROUTING =====
  function parseHash() {
    var hash = window.location.hash.replace('#', '');

    var page = window.location.pathname.match(/\/(schedule|speakers)(?:\/index\.html|\/)?$/);
    if (!hash) return { view: page ? page[1] : 'news', speaker: null, topic: null };

    // Check for topic detail: #topics/some-id
    var parts = hash.split('/');
    if (parts.length === 2 && parts[0] === 'topics') {
      return { view: 'topic-detail', speaker: null, topic: parts[1] };
    }

    // Check for speaker detail: #speakers/cipher-raven
    if (parts.length === 2 && parts[0] === 'speakers') {
      return { view: 'speaker-detail', speaker: parts[1], topic: null };
    }

    return { view: parts[0], speaker: null, topic: null };
  }

  function navigateTo(route) {
    if (route.view === 'speaker-detail') {
      closeTopicModal(false);
      switchView(speakerBackgroundView());
      // Highlight the linked speaker profile when visiting the speakers page.
      document.querySelectorAll('.speaker-profile').forEach(function (card) {
        var isActive = card.getAttribute('data-speaker') === route.speaker;
        card.classList.toggle('is-selected', isActive);
      });
      openSpeakerModal(route.speaker);
    } else if (route.view === 'topic-detail') {
      closeSpeakerModal(false);
      switchView('schedule');
      openTopicModal(route.topic);
    } else {
      closeSpeakerModal(false);
      closeTopicModal(false);
      switchView(route.view);
      document.querySelectorAll('.speaker-profile').forEach(function (card) {
        card.classList.remove('is-selected');
      });
    }
  }

  // Handle browser back/forward
  window.addEventListener('popstate', function () {
    navigateTo(parseHash());
  });

  // Handle clicks on speaker card links within detail nav
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#speakers/"]');
    if (link) {
      e.preventDefault();
      var speakerId = link.getAttribute('href').replace('#speakers/', '');
      pushRouteHash('#speakers/' + speakerId);
      navigateTo({ view: 'speaker-detail', speaker: speakerId });
    }
  });

  // ===== TIMESTAMP =====
  function updateTimestamp() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    var h = String(now.getHours()).padStart(2, '0');
    var min = String(now.getMinutes()).padStart(2, '0');
    var s = String(now.getSeconds()).padStart(2, '0');
    if (timestampEl) {
      timestampEl.textContent = y + '-' + m + '-' + d + ' ' + h + ':' + min + ':' + s;
    }
  }

  updateTimestamp();
  setInterval(updateTimestamp, 1000);

  // ===== COUNTDOWN =====
  function updateCountdown() {
    var now = Date.now();
    var diff = eventDate - now;

    if (diff <= 0) {
      if (countdownEl) {
        countdownEl.textContent = 'EVENT LIVE';
      }
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (countdownEl) {
      countdownEl.textContent =
        days + ' days, ' +
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ===== VIDEO PLAYERS =====
  document.querySelectorAll('.video-frame').forEach(function (frame) {
    var video = frame.querySelector('video');
    var playBtn = frame.querySelector('.video-play-overlay');
    if (!video || !playBtn) return;

    playBtn.addEventListener('click', function () {
      video.muted = false;
      video.play();
    });

    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      frame.classList.remove('is-playing');
    });

    video.addEventListener('ended', function () {
      frame.classList.remove('is-playing');
    });
  });

  // ===== INIT =====
  var initialRoute = parseHash();
  loadData().then(function () {
    navigateTo(initialRoute);
  });
})();
