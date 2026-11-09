// =====================================================================
// Site content. Every fact here comes from Nevin's CV.
// Edit this file to update projects, tools, experience, skills or certs.
// Anything not in the CV is marked TODO and is NOT shown as fake text.
// =====================================================================

export const GITHUB = 'https://github.com/nevinshaju07-coder';

/* ---------- Projects / products ----------
   links: [{ label, href }]. href: null => shown as "Link coming soon".
   mapping: frameworks the project is mapped to (only what the CV states). */
export const projects = [
  {
    id: 'haris',
    name: 'Haris AI',
    tagline: 'AI security gateway for chatbots and AI agents',
    status: 'In development',
    statusTone: 'amber',
    year: '2026',
    icon: 'gateway',
    summary: 'Blocks prompt injection, jailbreaks and UAE-specific data leakage (Emirates ID, IBAN, phone numbers) in chatbots and AI agents, and forwards alerts to the SIEM.',
    problem: 'Chatbots and AI agents can be manipulated by prompt injection and jailbreaks, and can leak sensitive data in their answers. Organisations in the UAE also need to catch local identifiers such as Emirates ID numbers, IBANs and UAE phone numbers before they leave the system.',
    built: [
      'A gateway that checks LLM inputs and outputs to stop prompt injection, jailbreaks and data leaks in chatbots and AI agents.',
      'UAE-specific data leak detection for Emirates ID numbers, IBANs and local phone numbers.',
      'Coverage for agent tool-use limits and RAG security.',
      'Alerts sent to the client SIEM.',
      'Attack techniques from the Lakera Gandalf challenges are used as test cases.'
    ],
    // TODO: Add the exact languages, libraries and models Haris AI uses (e.g. Python, FastAPI...). Not stated in the CV.
    tech: ['LLM input/output filtering', 'Data leak detection', 'RAG security', 'SIEM integration'],
    mapping: ['OWASP Top 10 for LLM Applications'],
    links: [
      // TODO: Add the Haris AI GitHub repo URL when it is public.
      { label: 'GitHub', href: null },
      // TODO: Add a demo or landing page URL if you have one.
      { label: 'Demo', href: null }
    ]
  },
  {
    id: 'aegissoc',
    name: 'AegisSOC',
    tagline: 'SIEM, EDR and AI detection lab',
    status: '2026',
    statusTone: 'cyan',
    year: '2026',
    icon: 'radar',
    summary: 'Wazuh + Sysmon + Atomic Red Team detection lab with 10 AI-application detections mapped to MITRE ATLAS and the OWASP LLM Top 10.',
    problem: 'Attacks on AI applications, such as prompt injection, system prompt leakage and risky tool use, need detections just like endpoint attacks do. Default SIEM rules also do not always surface what matters.',
    built: [
      'Wrote 10 detections for attacks on AI apps (prompt injection, system prompt leakage, risky tool use) mapped to MITRE ATLAS and the OWASP LLM Top 10.',
      'Ran Wazuh in Docker with a Windows 11 agent, Sysmon and CIS checks.',
      'Found that default rules held Sysmon events at level 0, so endpoint activity never showed up, and fixed it.',
      'Simulated attacks with Atomic Red Team and wrote ATT&CK-tagged rules for discovery, scheduled-task persistence, account creation and LSASS dumping.'
    ],
    tech: ['Wazuh', 'Docker', 'Windows 11', 'Sysmon', 'CIS checks', 'Atomic Red Team'],
    mapping: ['MITRE ATLAS', 'OWASP Top 10 for LLM Applications', 'MITRE ATT&CK'],
    links: [
      { label: 'GitHub', href: 'https://github.com/nevinshaju07-coder/aegissoc' }
    ]
  },
  {
    id: 'agentic',
    name: 'Agentic SOC',
    tagline: 'AI agents that investigate SIEM alerts',
    status: '2026',
    statusTone: 'cyan',
    year: '2026',
    icon: 'agents',
    summary: 'AI agents that triage, enrich and investigate SIEM alerts, with least-privilege tool access and human approval before containment.',
    problem: 'SOC analysts spend a lot of time on repetitive triage. AI agents can help, but agents with tool access are a new attack surface: they can be steered by prompt injection hidden in the data they read.',
    built: [
      'An agentic SOC where AI agents triage, enrich and investigate SIEM alerts through tool calls.',
      'Least-privilege tool access for the agents, with a human approval step before any containment action.',
      'Hardened the pipeline against prompt injection hidden inside alert data, logs and threat-intel results.',
      'Every agent decision and tool call is logged to the SIEM so investigations can be audited.'
    ],
    // TODO: Add the exact stack (agent framework, LLM, SIEM used). Not stated in the CV.
    tech: ['AI agents', 'Tool calling', 'SIEM', 'Audit logging'],
    // TODO: Add framework mapping if you mapped this project (e.g. OWASP LLM Top 10). Not stated in the CV.
    mapping: [],
    links: [
      // TODO: Add the Agentic SOC GitHub repo URL.
      { label: 'GitHub', href: null }
    ]
  },
  {
    id: 'splunklab',
    name: 'Splunk SOC & Network Detection Lab',
    tagline: 'SIEM, AD and network IDS home lab',
    status: 'Lab',
    statusTone: 'cyan',
    year: '',
    icon: 'network',
    summary: 'A SOC lab built on Splunk, Active Directory, Sysmon, Snort, Suricata and a T-Pot honeypot.',
    // TODO: Add a one-paragraph description of what you set out to detect in this lab.
    problem: 'A hands-on environment to practise SOC monitoring across endpoint, directory and network data in one place.',
    built: [
      'A lab combining Splunk with Active Directory and Sysmon endpoint logging.',
      'Network detection with Snort and Suricata.',
      'A T-Pot honeypot to capture attacker activity.'
      // TODO: Add the specific detections, dashboards or findings from this lab.
    ],
    tech: ['Splunk', 'Active Directory', 'Sysmon', 'Snort', 'Suricata', 'T-Pot'],
    // TODO: Add framework mapping (e.g. MITRE ATT&CK) if you used one in this lab.
    mapping: [],
    links: [
      // TODO: Add the Splunk lab GitHub repo URL.
      { label: 'GitHub', href: null }
    ]
  },
  {
    id: 'mlfound',
    name: 'ML Foundations',
    tagline: 'Neural nets and a language model from scratch',
    status: 'Learning',
    statusTone: 'cyan',
    year: '',
    icon: 'neural',
    summary: 'An autograd engine and neural network (Micrograd) and a character-level language model (makemore), built from scratch in Python.',
    problem: 'To attack and defend LLMs well, you need to know how they work under the hood, not only how to call an API.',
    built: [
      'A neural network and autograd engine built from scratch in Python (Micrograd).',
      'A character-level language model (makemore).',
      "Built while following Andrej Karpathy's Zero to Hero series."
    ],
    tech: ['Python', 'Backpropagation', 'Language modelling'],
    mapping: [],
    why: 'Shows I understand how LLMs work under the hood, which matters for attacking and defending them.',
    links: [
      { label: 'Micrograd', href: 'https://github.com/nevinshaju07-coder/Micrograd' },
      { label: 'makemore', href: 'https://github.com/nevinshaju07-coder/makemore' }
    ]
  }
];

/* ---------- Tools universe ---------- */
export const toolGroups = [
  { id: 'ai', label: 'AI security', color: '#22e4ff' },
  { id: 'siem', label: 'SIEM / SOC', color: '#5b8cff' },
  { id: 'off', label: 'Offensive / testing', color: '#ffb347' },
  { id: 'cloud', label: 'Cloud', color: '#b78bff' },
  { id: 'code', label: 'Code', color: '#4dffb0' }
];

export const tools = [
  // AI security
  { name: 'Prompt injection defence', group: 'ai', desc: 'Stopping crafted input from overriding an LLM’s instructions. Core of Haris AI.' },
  { name: 'Guardrails', group: 'ai', desc: 'Input and output checks that keep LLM apps inside safe behaviour.' },
  { name: 'RAG security', group: 'ai', desc: 'Protecting retrieval pipelines from poisoned or leaked documents.' },
  { name: 'MCP / tool-access security', group: 'ai', desc: 'Least-privilege tool access for AI agents, with human approval for risky actions.' },
  { name: 'MITRE ATLAS', group: 'ai', desc: 'Knowledge base of adversary tactics against AI systems. Used to map AegisSOC detections.' },
  { name: 'OWASP LLM Top 10', group: 'ai', desc: 'The top risks for LLM applications. Haris AI and AegisSOC are mapped to it.' },
  { name: 'NIST AI RMF', group: 'ai', desc: 'NIST framework for managing risk across the AI lifecycle.' },
  { name: 'ISO/IEC 42001', group: 'ai', desc: 'International standard for AI management systems.' },
  // SIEM / SOC
  { name: 'Microsoft Sentinel (KQL)', group: 'siem', desc: 'Cloud SIEM I used daily on a 24/7 MDR team, querying with KQL.' },
  { name: 'Splunk (SPL)', group: 'siem', desc: 'SIEM used for MDR investigations and in my SOC and network detection lab.' },
  { name: 'Wazuh', group: 'siem', desc: 'Open-source SIEM/XDR I ran in Docker for AegisSOC.' },
  { name: 'Elastic', group: 'siem', desc: 'Search and analytics stack used for security monitoring.' },
  { name: 'Sysmon', group: 'siem', desc: 'Windows endpoint telemetry. Fixed level-0 rule handling in AegisSOC.' },
  // Offensive / testing
  { name: 'Atomic Red Team', group: 'off', desc: 'Small, scripted attack tests used to validate detections.' },
  { name: 'MITRE ATT&CK', group: 'off', desc: 'Adversary tactics and techniques. My detection rules are tagged with it.' },
  { name: 'Snort', group: 'off', desc: 'Network intrusion detection, used in my Splunk network lab.' },
  { name: 'Suricata', group: 'off', desc: 'Network IDS/IPS engine, used in my Splunk network lab.' },
  { name: 'Wireshark', group: 'off', desc: 'Packet capture and protocol analysis.' },
  // Cloud
  { name: 'Azure', group: 'cloud', desc: 'Microsoft cloud. Identity, access and Zero Trust advice for clients.' },
  { name: 'AWS', group: 'cloud', desc: 'Managed EC2, security groups, IAM and least-privilege policies.' },
  { name: 'Google Cloud', group: 'cloud', desc: 'Certified Professional Cloud Security Engineer.' },
  // Code
  { name: 'Python', group: 'code', desc: 'Security tooling, automation and ML from scratch.' },
  { name: 'PowerShell', group: 'code', desc: 'Windows automation and investigation.' },
  { name: 'Bash', group: 'code', desc: 'Linux automation and scripting.' },
  { name: 'Docker', group: 'code', desc: 'Containerised labs, including Wazuh for AegisSOC.' }
];

/* ---------- Experience (newest first) ---------- */
export const experience = [
  {
    role: 'Freelance Cybersecurity Consultant',
    company: 'Manchester Cyber Digital',
    location: 'UK (remote)',
    dates: 'Sep 2025 to Present',
    current: true,
    bullets: [
      'Run purple-team exercises to see what a client’s tools really catch, then fix the gaps in rules, policy and process.',
      'Review security architecture and controls against ISO 27001 and NIST CSF, and give clients a prioritised remediation plan.',
      'Advise on cloud security, identity and access management, least privilege and Zero Trust.'
    ]
  },
  {
    role: 'SOC Analyst (Tier 1/2)',
    company: 'Industrus Tech',
    location: 'UK',
    note: '24/7 MDR for multiple clients',
    dates: 'Jan 2025 to Dec 2025',
    bullets: [
      'Triaged and investigated SIEM, endpoint and network alerts in Microsoft Sentinel (KQL) and Splunk (SPL).',
      'Handled phishing, malware, brute-force and unauthorised access incidents from scoping and root cause through to containment.',
      'Wrote and tuned detection rules mapped to MITRE ATT&CK to cut false positives for the analyst team.',
      'Spotted repetitive triage steps worth automating and improved our playbooks and SOPs.',
      'Kept clients updated on severity and impact, and closed incidents in ServiceNow within SLA.'
    ]
  },
  {
    role: 'Technical Support / Site Reliability Engineer',
    company: 'Industrus Tech',
    location: 'UK',
    dates: 'Sep 2024 to Sep 2025',
    bullets: [
      'Managed AWS security settings (EC2, security groups, IAM) and least-privilege access policies.',
      'Patched and hardened Windows servers, and supported Active Directory and the network.',
      'Tested releases and configuration changes under ITIL change control.'
    ]
  }
];

export const education = [
  {
    degree: 'MSc Cyber Security (Merit)',
    school: 'Leeds Beckett University, UK',
    dates: '2024 to 2025',
    note: 'NCSC-certified, BCS-accredited programme'
  },
  {
    degree: 'BTech Information Technology',
    school: 'A.P.J. Abdul Kalam Technological University, India',
    dates: '2019 to 2023'
  }
];

/* ---------- Skills (exactly as in the CV) ---------- */
export const skills = [
  { group: 'AI and ML security', items: ['LLM and Generative AI security', 'Agentic AI architectures', 'Prompt injection and jailbreak defences', 'Guardrails', 'RAG security', 'MCP and tool-access security', 'Adversarial machine learning', 'AI supply chain security', 'AI red teaming'] },
  { group: 'Frameworks', items: ['MITRE ATLAS', 'MITRE ATT&CK', 'OWASP Top 10 for LLM Applications', 'OWASP Top 10', 'NIST AI RMF', 'ISO/IEC 42001', 'ISO 27001', 'NIST CSF'] },
  { group: 'Testing', items: ['Threat modelling', 'Security architecture reviews', 'Vulnerability assessments', 'Adversarial and red-team testing', 'Purple teaming', 'Atomic Red Team'] },
  { group: 'Cloud security', items: ['Azure', 'AWS (IAM, EC2, security groups)', 'Google Cloud', 'Identity and access management', 'Least privilege', 'Zero Trust'] },
  { group: 'SecOps', items: ['Microsoft Sentinel (KQL)', 'Splunk (SPL)', 'Wazuh', 'Elastic', 'Detection engineering', 'Incident response'] },
  { group: 'DevSecOps and automation', items: ['Python', 'PowerShell', 'Bash', 'Docker', 'SOAR playbooks', 'Security tooling'] }
];

/* ---------- Certifications ----------
   verify: put your Credly / verification URL here. null => no link shown. */
export const certs = [
  // TODO: Add Credly/verification link for Google Cloud Professional Cloud Security Engineer
  { name: 'Professional Cloud Security Engineer', issuer: 'Google Cloud', tone: 'cyan', verify: null },
  // TODO: Add Credly/verification link for CompTIA Security+
  { name: 'Security+', issuer: 'CompTIA', tone: 'cyan', verify: null },
  // TODO: Add verification link for CEH v12
  { name: 'Certified Ethical Hacker (CEH v12)', issuer: 'EC-Council', tone: 'amber', verify: null },
  // TODO: Add Credly/verification link for AWS Certified Cloud Practitioner
  { name: 'AWS Certified Cloud Practitioner', issuer: 'AWS', tone: 'cyan', verify: null },
  // TODO: Add verification link for ITIL 4 Foundation
  { name: 'ITIL 4 Foundation', issuer: 'AXELOS / PeopleCert', tone: 'cyan', verify: null },
  // TODO: Add verification link for Fortinet NSE 1 and 2
  { name: 'NSE 1 and 2', issuer: 'Fortinet', tone: 'cyan', verify: null },
  // TODO: Add your TryHackMe public profile link
  { name: 'Top 1% Globally', issuer: 'TryHackMe', tone: 'amber', verify: null }
];
