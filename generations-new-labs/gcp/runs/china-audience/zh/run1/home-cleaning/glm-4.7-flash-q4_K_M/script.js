// 针对特定需求：所有脚本已内嵌于 booking.html 中，此处仅作为根目录下的公共脚本备选（本示例中未使用外部引用）。

// 可以将以下代码复制到 booking.html 的 <body> 底部以实现表单提交交互功能。

document.addEventListener('DOMContentLoaded', function() {
    // 设置日期输入框的最小值为今天
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
    }
    
    // 简单的表单提交模拟
    const form = document.getElementById('cleaningForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            btn.textContent = "正在提交...";
            btn.disabled = true;
            btn.style.opacity = "0.7";
            
            setTimeout(() => {
                this.style.display = 'none';
                document.getElementById('successMsg').style.display = 'block';
            }, 1500);
        });
    }
});
