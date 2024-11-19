// 預設輪盤項目
let items = JSON.parse(localStorage.getItem("wheelItems")) || ["項目 1", "項目 2", "項目 3", "項目 4", "項目 5"];
const canvas = document.getElementById("spin-wheel");
const ctx = canvas.getContext("2d");
// 設定輪盤的基本參數
let wheelRadius = 150;
let numSegments = items.length;
let currentAngle = 0; // 追踪輪盤當前的旋轉角度

// 儲存項目到 localStorage
function saveItemsToLocalStorage() {
    localStorage.setItem("wheelItems", JSON.stringify(items));
}

// 畫出輪盤
function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const segmentAngle = 2 * Math.PI / numSegments;
    // 畫每個區塊
    for (let i = 0; i < numSegments; i++) {
        const startAngle = i * segmentAngle;
        const endAngle = startAngle + segmentAngle;
        // 每個區塊的顏色（用不同的顏色填充）
        ctx.fillStyle = `hsl(${i * 360 / numSegments}, 100%, 70%)`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        // 填充項目文字
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.fillStyle = "#fff";
        ctx.font = "16px Arial";
      // 添加文字陰影
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)"; // 陰影顏色
        ctx.shadowOffsetX = 2; // 陰影的水平偏移量
        ctx.shadowOffsetY = 2; // 陰影的垂直偏移量
        ctx.shadowBlur = 4; // 陰影的模糊程度
        // 調整文字顯示位置，讓文字靠近中心
        ctx.fillText(items[i], wheelRadius - 100, 5);
        ctx.restore();
    }
}

// 旋轉輪盤
function spinWheel() {
    // 亂數選擇旋轉的角度
    const randomDegree = Math.floor(Math.random() * 360);
    const spinDuration = 3000;
    const rotation = randomDegree + 7200; // 旋轉兩圈加隨機角度
    // 清除先前的過渡效果，確保每次旋轉都能順暢
    canvas.style.transition = 'none'; 
    // 重設輪盤角度，避免跳動
    canvas.style.transform = `rotate(0deg)`;
    
    // 延遲後觸發過渡效果
    setTimeout(() => {
        // 設定過渡動畫
        canvas.style.transition = `transform ${spinDuration}ms ease-out`;
        canvas.style.transform = `rotate(${rotation}deg)`;
        // 更新當前旋轉角度
        currentAngle = rotation % 360;
        // 計算旋轉結束時對應的項目
        const selectedIndex = Math.floor((randomDegree + 7200 + currentAngle) / (360 / numSegments)) % numSegments;
        setTimeout(() => {
            alert(`你選到了：${items[selectedIndex]}`);
        }, spinDuration);
    }, 10); // 讓過渡效果能夠重新設置
}

// 新增項目
function addItem() {
    const itemInput = document.getElementById("item-input");
    const newItem = itemInput.value.trim();
    if (newItem) {
        items.push(newItem);
        itemInput.value = '';
        numSegments = items.length; // 更新項目數量
        saveItemsToLocalStorage(); // 儲存到 localStorage
        drawWheel();
    }
}

// 創建刪除項目對話框
function createDeleteDialog() {
    // 創建對話框容器
    const dialogContainer = document.createElement('div');
    dialogContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        width: 300px;
        max-height: 80vh;
        overflow-y: auto;
    `;

    // 創建標題
    const title = document.createElement('h3');
    title.textContent = '選擇要刪除的項目';
    title.style.marginBottom = '15px';

    // 創建項目列表
    const itemList = document.createElement('div');
    items.forEach((item, index) => {
        const itemContainer = document.createElement('div');
        itemContainer.style.marginBottom = '10px';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `delete-item-${index}`;
        checkbox.style.marginRight = '10px';
        
        const label = document.createElement('label');
        label.htmlFor = `delete-item-${index}`;
        label.textContent = item;
        
        itemContainer.appendChild(checkbox);
        itemContainer.appendChild(label);
        itemList.appendChild(itemContainer);
    });

    // 創建按鈕容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';

    // 創建確認按鈕
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '刪除所選項目';
    confirmButton.style.cssText = `
        padding: 8px 16px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;

    // 創建取消按鈕
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.style.cssText = `
        padding: 8px 16px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;

    // 添加遮罩層
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999;
    `;

    // 清除對話框和遮罩的函數
    const clearDialog = () => {
        document.body.removeChild(dialogContainer);
        document.body.removeChild(overlay);
    };

    // 添加按鈕點擊事件
    confirmButton.onclick = () => {
        const itemsToDelete = [];
        document.querySelectorAll('[id^="delete-item-"]').forEach((checkbox, index) => {
            if (checkbox.checked) {
                itemsToDelete.push(index);
            }
        });

        // 從後面開始刪除，避免索引變化影響刪除操作
        itemsToDelete.sort((a, b) => b - a).forEach(index => {
            items.splice(index, 1);
        });

        numSegments = items.length;
        drawWheel();
        clearDialog(); // 使用新的清除函數
        
        if (itemsToDelete.length > 0) {
            alert(`已刪除 ${itemsToDelete.length} 個項目`);
        }
    };

    cancelButton.onclick = clearDialog; // 使用新的清除函數

    // 組裝對話框
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    dialogContainer.appendChild(title);
    dialogContainer.appendChild(itemList);
    dialogContainer.appendChild(buttonContainer);
    
    // 添加到頁面
    document.body.appendChild(overlay);
    document.body.appendChild(dialogContainer);
}

// 修改刪除項目函數
function removeItem() {
    if (items.length === 0) {
        alert("目前沒有可刪除的項目");
        return;
    }
    createDeleteDialog();
}

// 修改雙擊事件處理
canvas.addEventListener("dblclick", (event) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    // 檢查點擊是否在輪盤範圍內
    const distance = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));
    if (distance > wheelRadius || distance < 20) { // 20是中心區域的半徑
        return; // 如果點擊在輪盤外或太靠近中心，不處理
    }

    // 計算點擊位置的角度
    let angle = Math.atan2(mouseY - centerY, mouseX - centerX);
    if (angle < 0) {
        angle += 2 * Math.PI;
    }

    // 考慮輪盤當前旋轉角度（轉換為弧度）
    const currentAngleRad = (currentAngle * Math.PI) / 180;
    
    // 調整角度
    let adjustedAngle = angle;
    if (currentAngleRad > 0) {
        adjustedAngle = angle + currentAngleRad;
        if (adjustedAngle >= 2 * Math.PI) {
            adjustedAngle -= 2 * Math.PI;
        }
    }

    // 計算點擊位置對應的項目索引
    const segmentAngle = 2 * Math.PI / items.length;
    const clickedIndex = Math.floor(adjustedAngle / segmentAngle);
    
    // 確保索引在有效範圍內
    const validIndex = ((clickedIndex % items.length) + items.length) % items.length;
    
    // 使用臨時的 canvas 來檢查點擊位置
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // 在臨時 canvas 上繪製每個項目的區域
    items.forEach((item, index) => {
        const startAngle = index * (2 * Math.PI / items.length);
        const endAngle = (index + 1) * (2 * Math.PI / items.length);
        
        tempCtx.beginPath();
        tempCtx.moveTo(centerX, centerY);
        tempCtx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
        tempCtx.closePath();
        
        // 檢查點擊位置是否在這個區域內
        if (tempCtx.isPointInPath(mouseX, mouseY)) {
            // 找到匹配的項目，顯示編輯對話框
            const itemToEdit = items[index];
            const newName = prompt(`編輯項目: ${itemToEdit}`, itemToEdit);
            
            if (newName && newName.trim() !== "") {
                items[index] = newName.trim();
                saveItemsToLocalStorage(); // 儲存到 localStorage
                drawWheel();
            }
        }
    });
});

// 初始繪製輪盤
drawWheel();