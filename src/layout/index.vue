<template>
    <div id="windows">
        <top-bar id="top-bar"></top-bar>
        <section id="main-windows">
            <router-view ref="mainWindows" ></router-view>
        </section>
        <div v-if="showOutLine" id="out-line">
            <div @click="retweet" class="retweet">
                <i style="font-size: 10px; color: white; margin-right: 5px;" class="fa-solid fa-retweet"></i>
                <span v-if="this.serverSign" style="color: white;">s</span>
                <span v-else style="color: white;">c</span>
            </div>
            <div style="display: flex;  direction: rtl; width: 100%;">
                <i @click="showLog" style="font-size: 10px; color: white; margin-right: 5px;" class="fa-solid fa-circle-chevron-up"></i>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import TopBar from '@/components/TopBar'

export default {
    components: {
        TopBar,
    },
    data() {
        return {
            retweetSign : false,
            serverSign : false,
            showOutLine : false
        }
    },
    watch: {
        $route(to) {
            if (to.path === '/login') {
                this.serverSign = false
                this.showOutLine = false
                this.$nextTick(() => {
                    const mainWindows = document.querySelector("#main-windows");
                    if (mainWindows) {
                        mainWindows.style.height = "calc(100% - 6vh)";
                    }
                })
            } else {
                this.showOutLine = true
                this.$nextTick(() => {
                    const mainWindows = document.querySelector("#main-windows");
                    if (mainWindows) {
                        mainWindows.style.height = "calc(100% - 6vh - 20px)";
                    }
                })
            }
        }
    },
    mounted() {
        this.showOutLine = true
        this.$nextTick(() => {
            const mainWindows = document.querySelector("#main-windows");
            if (mainWindows) {
                mainWindows.style.height = "calc(100% - 6vh - 20px)";
            }
        })
    },
    methods: {
        showLog() {
            if(this.serverSign == true) {
                this.$refs.mainWindows.showLogBar();
            } else {
                this.$refs.mainWindows.showLogBarClient();
            }
        },
        retweet() {
            this.serverSign = !this.serverSign
            this.$nextTick(() => {
                this.$refs.mainWindows.serverSwap(this.serverSign);
            })
        }
    }
}
</script>

<style lang="scss" scoped>
#windows {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}

#main-windows {
    width: 100%;
    height: calc(100% - 6vh - 20px);
    overflow: auto;
}

#top-bar {
    width: 100%;
    height: 6vh;
}
#out-line {
    width: 100%;
    height: 20px;
    background-color: #012596;
    display: flex;
    align-items: center;
    gap : 10px;
}

.retweet {
    display: flex;
    direction: ltr;
    background-color: #088F8F;
    height: 100%;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
