// بيانات الاعتماد الخاصة بخدمة العملاء
const SUPPORT_PHONE = "01093393903";
const SUPPORT_NAME = "خدمة العملاء";

let currentUser = null;
let isSupport = false;
let messageQueue = [];
let checkInterval = null;

// عناصر DOM
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const usernameInput = document.getElementById('username');
const phoneInput = document.getElementById('phone');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');
const messagesBox = document.getElementById('messagesBox');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const chatTitle = document.getElementById('chatTitle');
const logoutBtn = document.getElementById('logoutBtn');

// ===== التحقق من وجود مستخدم محفوظ =====
function loadSavedUser() {
    try {
        const saved = localStorage.getItem('chatUser');
        if (saved) {
            const userData = JSON.parse(saved);
            if (userData.name && userData.phone) {
                currentUser = userData;
                isSupport = (userData.phone === SUPPORT_PHONE && userData.name === SUPPORT_NAME);
                enterChat();
                return true;
            }
        }
    } catch (e) {
        localStorage.removeItem('chatUser');
    }
    return false;
}

// ===== حفظ المستخدم =====
function saveUser(user) {
    localStorage.setItem('chatUser', JSON.stringify(user));
}

// ===== تسجيل الخروج =====
function logout() {
    if (confirm('⚠️ هل أنت متأكد من تسجيل الخروج؟')) {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
        
        localStorage.removeItem('chatUser');
        currentUser = null;
        isSupport = false;
        chatScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
        messagesBox.innerHTML = '';
        messageQueue = [];
        usernameInput.value = '';
        phoneInput.value = '';
        errorMsg.style.display = 'none';
    }
}

// ===== الدخول للشات =====
function enterChat() {
    loginScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    
    if (isSupport) {
        chatTitle.textContent = '📞 لوحة تحكم الدعم';
        addMessage('💬 أنت الآن خدمة العملاء', 'system');
        addMessage('👥 ستظهر لك رسائل العملاء فوراً بأسمائهم', 'system');
        startMessageChecking();
    } else {
        chatTitle.textContent = '💬 محادثة مع الدعم';
        addMessage('👋 مرحباً ' + currentUser.name + '!', 'system');
        addMessage('📨 يمكنك كتابة رسالتك وسيتم إرسالها فوراً للدعم.', 'system');
    }
}

// ===== بدء فحص الرسائل الواردة =====
function startMessageChecking() {
    if (checkInterval) {
        clearInterval(checkInterval);
    }
    
    checkInterval = setInterval(() => {
        if (messageQueue.length > 0) {
            const messages = [...messageQueue];
            messageQueue = [];
            
            messages.forEach(msg => {
                addMessage(`👤 ${msg.senderName}\n${msg.text}`, 'customer');
            });
        }
    }, 1500);
}

// ===== تسجيل الدخول =====
loginBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = '⚠️ الرجاء إدخال الاسم والرقم';
        return;
    }

    if (!/^\d+$/.test(phone)) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = '⚠️ الرجاء إدخال أرقام فقط في رقم الهاتف';
        return;
    }

    errorMsg.style.display = 'none';
    
    if (phone === SUPPORT_PHONE && name === SUPPORT_NAME) {
        isSupport = true;
        currentUser = { name, phone, role: 'support' };
    } else {
        isSupport = false;
        currentUser = { name, phone, role: 'customer' };
    }
    
    saveUser(currentUser);
    enterChat();
});

// ===== تسجيل الخروج =====
logoutBtn.addEventListener('click', logout);

// ===== إرسال رسالة =====
function sendMessage() {
    const text = msgInput.value.trim();
    if (!text) return;

    if (isSupport) {
        addMessage('📨 ' + text, 'support');
        setTimeout(() => {
            addMessage('✅ تم إرسال ردك للعميل.', 'system');
        }, 300);
    } else {
        const customerMessage = {
            senderName: currentUser.name,
            text: text,
            timestamp: new Date().toISOString()
        };
        
        addMessage(`🧑 ${text}`, 'customer');
        messageQueue.push(customerMessage);
        
        setTimeout(() => {
            addMessage('📞 (الدعم) تم استلام رسالتك، سنرد قريباً.', 'support');
        }, 500 + Math.random() * 500);
    }

    msgInput.value = '';
    msgInput.focus();
}

// ===== إضافة رسالة =====
function addMessage(text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    
    if (type === 'customer' && text.includes('👤')) {
        const parts = text.split('\n');
        if (parts.length === 2) {
            const nameSpan = document.createElement('span');
            nameSpan.className = 'sender-name';
            nameSpan.textContent = parts[0];
            
            const textSpan = document.createElement('span');
            textSpan.textContent = parts[1];
            
            msgDiv.appendChild(nameSpan);
            msgDiv.appendChild(textSpan);
        } else {
            msgDiv.textContent = text;
        }
    } else {
        msgDiv.textContent = text;
    }
    
    messagesBox.appendChild(msgDiv);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

// ===== الأحداث =====
sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// ===== تشغيل التطبيق =====
document.addEventListener('DOMContentLoaded', function() {
    const hasSaved = loadSavedUser();
    
    if (!hasSaved) {
        loginScreen.style.display = 'flex';
        chatScreen.style.display = 'none';
    }
});

// ===== تنظيف عند إغلاق الصفحة =====
window.addEventListener('beforeunload', () => {
    if (checkInterval) {
        clearInterval(checkInterval);
    }
});

console.log('✅ شات خدمة العملاء - يعمل بنجاح');