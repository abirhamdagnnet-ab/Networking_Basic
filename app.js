// ===== NAVIGATION =====
const sections = ['osi','protocols','devices','security','subnet','commands','quiz','checklist'];

function showSection(id) {
  sections.forEach(s => {
    document.getElementById('sec-' + s).classList.remove('active');
  });
  document.querySelectorAll('.nav-btn').forEach((b, i) => {
    b.classList.toggle('active', sections[i] === id);
  });
  document.getElementById('sec-' + id).classList.add('active');
}

// ===== SUBNET CALCULATOR =====
function calcSubnet() {
  const ip     = document.getElementById('ipInput').value.trim();
  const prefix = parseInt(document.getElementById('prefixInput').value);
  const parts  = ip.split('.').map(Number);

  if (
    parts.length !== 4 ||
    parts.some(p => isNaN(p) || p < 0 || p > 255) ||
    isNaN(prefix) || prefix < 1 || prefix > 30
  ) {
    alert('Please enter a valid IP and prefix (1-30)');
    return;
  }

  const maskBits  = ~0 << (32 - prefix);
  const ipInt     = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
  const netInt    = ipInt & maskBits;
  const broadInt  = netInt | ~maskBits;
  const toIP      = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  const hosts     = Math.pow(2, 32 - prefix) - 2;
  const maskOctets = [
    (maskBits >>> 24) & 255,
    (maskBits >>> 16) & 255,
    (maskBits >>> 8)  & 255,
     maskBits         & 255,
  ];

  document.getElementById('res-mask').textContent      = maskOctets.join('.');
  document.getElementById('res-network').textContent   = toIP(netInt);
  document.getElementById('res-first').textContent     = toIP(netInt + 1);
  document.getElementById('res-last').textContent      = toIP(broadInt - 1);
  document.getElementById('res-broadcast').textContent = toIP(broadInt);
  document.getElementById('res-hosts').textContent     = hosts.toLocaleString();
  document.getElementById('subnetResult').style.display = 'block';
}

// ===== QUIZ =====
const questions = [
  {
    q: "Which OSI layer is responsible for routing packets between different networks?",
    opts: ["Layer 2 – Data Link","Layer 3 – Network","Layer 4 – Transport","Layer 5 – Session"],
    ans: 1,
    explain: "Layer 3 (Network) handles routing using IP addresses. Routers operate at this layer."
  },
  {
    q: "A bank wants to isolate ATM traffic from employee traffic on the same physical switch. What technology should they use?",
    opts: ["Subnetting","VPN","VLAN","Firewall rules"],
    ans: 2,
    explain: "VLANs (Virtual LANs) logically separate traffic on the same physical switch. ATM, staff, and management networks each get their own VLAN."
  },
  {
    q: "What does DHCP do?",
    opts: ["Encrypts data in transit","Translates domain names to IPs","Automatically assigns IP addresses to devices","Monitors network traffic"],
    ans: 2,
    explain: "DHCP (Dynamic Host Configuration Protocol) automatically gives devices an IP address, subnet mask, gateway, and DNS server when they connect to the network."
  },
  {
    q: "Which protocol does ping use to test connectivity?",
    opts: ["TCP","UDP","ICMP","ARP"],
    ans: 2,
    explain: "Ping uses ICMP (Internet Control Message Protocol) — specifically ICMP Echo Request and Echo Reply messages."
  },
  {
    q: "What port does HTTPS use?",
    opts: ["Port 80","Port 443","Port 22","Port 21"],
    ans: 1,
    explain: "HTTPS uses port 443. Port 80 is plain HTTP, port 22 is SSH, and port 21 is FTP."
  },
  {
    q: "What is the broadcast address for the network 192.168.1.0/24?",
    opts: ["192.168.1.0","192.168.1.1","192.168.1.254","192.168.1.255"],
    ans: 3,
    explain: "For a /24 network, the last address (192.168.1.255) is the broadcast. The network address is .0, first usable is .1, last usable is .254."
  },
  {
    q: "In the CIA triad, 'Availability' means:",
    opts: ["Only authorized users can read data","Data has not been altered or tampered with","Systems are accessible when needed","All data is encrypted"],
    ans: 2,
    explain: "Availability means systems, services, and data are accessible when authorized users need them. Banks ensure this with redundancy, backups, and disaster recovery plans."
  },
  {
    q: "What is the difference between IDS and IPS?",
    opts: ["IDS blocks threats; IPS only detects them","IDS detects and alerts; IPS detects and blocks","Both do the same thing","IDS is hardware; IPS is software"],
    ans: 1,
    explain: "IDS (Intrusion Detection System) only monitors and alerts — it does not block. IPS (Intrusion Prevention System) actively blocks threats in real time."
  },
  {
    q: "Which command shows all active network connections and listening ports on a Windows PC?",
    opts: ["ipconfig /all","arp -a","netstat -an","tracert"],
    ans: 2,
    explain: "netstat -an shows all active TCP/UDP connections and listening ports. Very useful for seeing what is communicating on a machine."
  },
  {
    q: "Banks use MPLS to connect their branches. What is MPLS?",
    opts: ["A type of firewall","Multi-Protocol Label Switching — a fast WAN technology","A wireless protocol","A type of VPN encryption"],
    ans: 1,
    explain: "MPLS (Multi-Protocol Label Switching) is a WAN technology that uses labels instead of IP lookups to forward packets very efficiently. Banks use it for dedicated, reliable branch connectivity."
  }
];

let score    = 0;
let answered = 0;

function buildQuiz() {
  const container = document.getElementById('quizContainer');
  container.innerHTML = '';
  score = 0;
  answered = 0;
  updateScore();

  questions.forEach((q, qi) => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.innerHTML = `
      <div class="quiz-q">Q${qi + 1}. ${q.q}</div>
      <div class="quiz-options">
        ${q.opts.map((o, oi) => `
          <button class="quiz-opt" onclick="answer(${qi},${oi})" id="opt-${qi}-${oi}">
            <span class="opt-letter">${'ABCD'[oi]}</span> ${o}
          </button>
        `).join('')}
      </div>
      <div class="quiz-feedback" id="fb-${qi}"></div>
    `;
    container.appendChild(card);
  });
}

function answer(qi, oi) {
  const q    = questions[qi];
  const opts = document.querySelectorAll(`[id^="opt-${qi}-"]`);
  const fb   = document.getElementById('fb-' + qi);

  opts.forEach(o => o.disabled = true);

  if (oi === q.ans) {
    opts[oi].classList.add('correct');
    fb.textContent = '✓ Correct! ' + q.explain;
    fb.className   = 'quiz-feedback show correct-fb';
    score++;
  } else {
    opts[oi].classList.add('wrong');
    opts[q.ans].classList.add('correct');
    fb.textContent = '✗ The correct answer is ' + q.opts[q.ans] + '. ' + q.explain;
    fb.className   = 'quiz-feedback show wrong-fb';
  }

  answered++;
  updateScore();
  updateProgress();
}

function updateScore() {
  document.getElementById('quizScore').textContent =
    `Score: ${score} / ${answered} answered out of ${questions.length}`;
}

function resetQuiz() {
  buildQuiz();
  updateProgress();
}

// ===== CHECKLIST =====
const checkItems = [
  "Memorized all 7 OSI layers and their functions",
  "Know the mnemonic: Please Do Not Throw Sausage Pizza Away",
  "Can explain TCP vs UDP difference",
  "Know common port numbers (22, 53, 80, 443, 25, etc.)",
  "Understand what a VLAN is and why banks use them",
  "Can explain the CIA Triad (Confidentiality, Integrity, Availability)",
  "Know the difference between IDS and IPS",
  "Practiced subnetting at least 10 examples",
  "Can use: ping, tracert, ipconfig, netstat, nslookup",
  "Know basic Cisco commands: show ip route, show vlan brief",
  "Understand what a firewall does and what a DMZ is",
  "Know what MPLS is and why banks use it",
  "Understand what VPN is and the two main types",
  "Know how DHCP and DNS work",
  "Reviewed my internship application letter",
  "Prepared 5 questions to ask on the first day",
  "Dressed professionally and brought a notebook",
];

const checked = new Set();

function buildChecklist() {
  const c = document.getElementById('checklistContainer');
  c.innerHTML = '';

  checkItems.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'check-item' + (checked.has(i) ? ' done' : '');
    div.innerHTML = `
      <div class="check-box">${checked.has(i) ? '✓' : ''}</div>
      <div class="check-text">${item}</div>
    `;
    div.onclick = () => {
      if (checked.has(i)) checked.delete(i);
      else checked.add(i);
      buildChecklist();
      updateProgress();
    };
    c.appendChild(div);
  });
}

// ===== PROGRESS =====
function updateProgress() {
  const total = checkItems.length + questions.length;
  const done  = checked.size + score;
  const pct   = Math.round((done / total) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = pct + '% complete — keep going!';
}

// ===== INIT =====
buildQuiz();
buildChecklist();
updateProgress();