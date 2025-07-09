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
                    <i :class="['fa-solid', 'fa-rotate-right', { spin: isLoadingReload }]" style="font-size: 15px;" @click="reloadLog"></i>
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
                    <div v-if="item.type === 'INSERT'" class="icon"><i style="color: green; background-color: white;" class="fa-solid fa-square-check"></i></div>
                    <div v-else-if="item.type === 'UPDATE'" class="icon"><i style="background-color: white; color: yellow;" class="fa-solid fa-triangle-exclamation"></i></div>
                    <div v-else-if="item.type === 'ERROR'" class="icon"><i style="background-color: white; color: red;" class="fa-solid fa-bug"></i></div>
                    <div v-else class="icon"></div>
                    <div class="header-icon" >{{ item.effective_date_time }}</div>
                    <div class="header-icon">{{ item.type }}</div>
                    <div class="header-icon">{{ item.user_name }}</div>
                    <div class="header-icon">{{ item.name }}</div>
                    <div class="header-message">{{ item.description }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name : 'LogBar',
    props: {
        logData: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            isLoadingReload: false,
        }
    },
    methods: {
        hideLog() {
            this.$emit("hideLogBar", false);
        },
        reloadLog() {
            this.isLoadingReload = true;
            this.$emit("reloadLog", () => {
                this.isLoadingReload = false;
            });
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
    white-space: nowrap;         /* Không xuống dòng */
    overflow: hidden;            /* Ẩn phần vượt quá khung */
    text-overflow: ellipsis;
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

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>