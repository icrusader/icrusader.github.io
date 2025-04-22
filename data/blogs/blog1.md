# 🛡️ Defense Lab Write-up (Recon: Part 1)

## 👋 Introduction  
In the CS 596 Defense Lab, I was tasked with hardening a Linux system that had been **backdoored**. My mission: patch up vulnerable services to ensure uptime and eliminate bugs or exploits that could be weaponized.

---

## 🔍 Initial Backdoor Recon

Two user credentials were provided:  
- 👤 `mrrobot/mrrobot`  
- 👤 `elliot/fsociety`  

I started by logging in as **elliot** and began probing for suspicious activity.

🔎 I ran:
```bash
find . -iname ".*" 2>/dev/null
```
🧠 This looks for hidden files in Elliot's home directory.

### 📂 Suspicious Find  
![Terminal Screenshot](assets/images/blog_images/blog1/1.png)  
✅ **Backdoor directory found!**

I then inspected the contents. One file stood out:

![Terminal Screenshot](assets/images/blog_images/blog1/2.png)  
🚪 Port **33123** was revealed — definitely shady.

To broaden the search, I looked for any files referencing “backdoor”:
```bash
grep -lir "backdoor"
```

![Terminal Screenshot](assets/images/blog_images/blog1/3.png)

📌 `.bashrc` stood out — unlike `.bash_history`, this file runs **every time a terminal session starts.**

Opening it revealed injected code at the end:

![Terminal Screenshot](assets/images/blog_images/blog1/4.png)

🔍 A `diff` against the default `.bashrc` confirmed it was tampered with:

![Terminal Screenshot](assets/images/blog_images/blog1/5.png)

To ensure system-wide coverage, I ran a privileged search through the root directory. Nothing new turned up, but some **root shell history** hinted at previous exploration — likely part of the lab setup.

---

## 🔐 Interesting Find in `.ssh`

Next up: the SSH service.

🧭 I ran:
```bash
sudo find / -iname "authorized_keys" 2>/dev/null
```

![Terminal Screenshot](assets/images/blog_images/blog1/6.png)

📁 Two hits! One can be ignored as it’s part of setup. But the other in `mrrobot`’s `.ssh` directory contained key pairs that **should’ve been on the attacker machine.**

Testing this key, I successfully:

1. SSH’d into `mrrobot`  
2. Gained privilege escalation via a **vulnerable sudo version**

![Terminal Screenshot](assets/images/blog_images/blog1/7.png)  
![Terminal Screenshot](assets/images/blog_images/blog1/8.png)  
![Terminal Screenshot](assets/images/blog_images/blog1/9.png)

✅ **Confirmed another backdoor!**  
💥 **Vulnerability:** CVE-2021-3156 (sudo heap-based buffer overflow)

---

## 🧪 Vulnerable Services Discovery

Time to check hosted services:
```bash
sudo ss -lntup
```

![Terminal Screenshot](assets/images/blog_images/blog1/10.png)

📡 Open ports included:
- 🟢 SSH (22)
- 🟢 Apache2
- 🟢 MySQL
- 🟢 CUPS
- 🔴 Backdoor (33123)

Knowing Apache is running, I investigated both `/var/www/html/` and a `services` directory in Elliot’s home (as per the README). Let’s see what we’re dealing with:

![Terminal Screenshot](assets/images/blog_images/blog1/11.png)

🛠️ Multiple services were vulnerable. Let’s dive in.

---

## 📁 Services Directory

### ☠️ Arbitrary File Upload

Found vulnerable file: `upload.php`.  
From a red-team perspective, I explored the exploitability.

Inside `/var/www/html/arbitrary_file_upload/images/` — found a `shell.php`. Ran the following:

![Terminal Screenshot](assets/images/blog_images/blog1/12.png)  

📜 Encoded command:
![Terminal Screenshot](assets/images/blog_images/blog1/encoded.png)

This gave me a **reverse shell on port 4444**!

![Terminal Screenshot](assets/images/blog_images/blog1/13.png)  
✅ Another backdoor confirmed via **file upload exploit**.  
⚠️ Gained access as `www-data` — limited, but still useful for further enumeration.

---

### 🐍 Python Command Injection

Next, the `python_command_injection` vulnerability.

![Terminal Screenshot](assets/images/blog_images/blog1/14.png)

I launched the service and communicated using `nc`. Injected a payload:

![Terminal Screenshot](assets/images/blog_images/blog1/15.png)

✅ Boom! Code execution confirmed.

Then I ran a custom script from the attacker machine to exploit it further:

![Terminal Screenshot](assets/images/blog_images/blog1/16.png)  
![Terminal Screenshot](assets/images/blog_images/blog1/17.png)

🔥 Full command execution achieved!

---

*To be continued…*
