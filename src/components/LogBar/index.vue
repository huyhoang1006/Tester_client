<template>
    <div class="logbar">
        <div class="option-bar">
            <div style="width: 50%;">
            </div>
            <div style="width: 50%; display: flex; align-items: center;">
                <input
                style="width: 50%; border: 1px solid #ccc; outline: none; height: 20px; box-sizing: border-box;"
                type="text"
                placeholder="Filter..."
                >
                <div style="width: 50%; height: 100%; box-sizing: border-box; display: flex; align-items: center; align-items: center; direction: rtl; gap: 10px;">
                    <i style="font-size: 15px; margin-right: 5px;" @click="hideLog" class="fa-solid fa-square-caret-down"></i>
                    <i style="font-size: 15px;" class="fa-solid fa-square-caret-up"></i>
                </div>
            </div>
        </div>
        <div class="table-content">
            <div class="header">
                <div class="icon"></div>
                <div class="header-icon">Date & Time</div>
                <div class="header-icon">Category</div>
                <div class="header-icon">User</div>
                <div class="header-icon">Object</div>
                <div class="header-message">Message</div>
            </div>
            <div class="content-log">
                <div v-for="(item, index) in logData" :key="index" class="content">
                    <div class="icon"></div>
                    <div class="header-icon">Date & Time</div>
                    <div class="header-icon">Category</div>
                    <div class="header-icon">User</div>
                    <div class="header-icon">Object</div>
                    <div class="header-message">Message</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name : 'LogBar',
    data() {
        return {
            logData : [1, 2, 3, 4, 5, 6]
        }
    },
    methods: {
        hideLog() {
            this.$emit("hideLogBar", false);
        }
    }
}
</script>
<style scoped>
.logbar {
    width: 100%;
    box-sizing: border-box;
    border-left: none;
    border-right: none;
    height: 100%;
}

.table-content::-webkit-scrollbar {
    display: none; /* Ẩn trên Chrome, Safari */
}


.option-bar {
    width: 100%;
    height: 30px;
    display: flex;
    box-sizing: border-box;
}
.table-content {
    width: 100%;
    height: calc(100% - 30px);
    border: 1px #012596 solid;
    box-sizing: border-box;
    -ms-overflow-style: none;  /* Ẩn trên IE & Edge */
    scrollbar-width: none;  /* Ẩn trên Firefox */
    overflow-y: scroll; /* Đảm bảo tbody cuộn, thead cố định */
    position: relative;
}
.log-body {
    width: 100%;
    height: calc(100% - 30px);
    overflow: auto;
    box-sizing: border-box;
}

.header {
    width: 100%;
    display: flex;
    height: 30px;
    box-sizing: border-box;
    background-color: #ddd;
    position: sticky;
    top: 0;
    z-index: 10; /* Đảm bảo header hiển thị trên nội dung */
}

.content {
    display: flex;
    width: 100%;
    height: calc(100%/3 );
    box-sizing: border-box;
    background-color: white;
}

.content:hover {
    background-color: #ddd;
}

.content-log {
    width: 100%;
    height: calc(100% - 30px);
}
</style>
<style scoped>
.icon {
    width: 5%;
    height: 100%;
    box-sizing: border-box;
    border: 1px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
}
.header-icon {
    width: 10%;
    font-weight: 700;
    border: 1px solid white;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 5px;
    box-sizing: border-box;
}
.header-message {
    width: 55%;
    font-weight: 700;
    border: 1px solid white;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 5px;
    box-sizing: border-box;
}
</style>