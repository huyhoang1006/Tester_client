<template>
    <div id="windows" :class="{ 'logged-in': user }">
        <top-bar id="top-bar"></top-bar>
        <section id="main-windows">
            <router-view ref="mainWindows"></router-view>
        </section>
        <div v-if="user" id="out-line">
            <div @click="retweet" class="retweet">
                <i class="fa-solid fa-retweet"></i>
                <span>{{ serverSign ? 's' : 'c' }}</span>
            </div>
            <div class="outline-right">
                <i @click="showLog" class="fa-solid fa-circle-chevron-up"></i>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import TopBar from '@/components/TopBar'
import { mapState } from 'vuex'

export default {
    components: { TopBar },
    computed: {
        ...mapState(['user'])
    },
    data() {
        return {
            serverSign: false,
        }
    },
    methods: {
        showLog() {
            this.serverSign
                ? this.$refs.mainWindows.showLogBar()
                : this.$refs.mainWindows.showLogBarClient()
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
* {
    box-sizing: border-box;
}

#windows {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
}

#windows:not(.logged-in) {
    display: block;
}

#windows:not(.logged-in) #top-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    background-color: transparent;
    border-bottom: none;
}

#windows:not(.logged-in) #main-windows {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
}

#windows.logged-in {
    display: flex;
    flex-direction: column;
}

#windows.logged-in #top-bar {
    flex: 0 0 48px;
    z-index: 10;
    width: 100%;
}

#windows.logged-in #main-windows {
    flex: 1;
    min-height: 0;
    overflow: auto;
    position: relative;
    width: 100%;
}

#windows.logged-in #out-line {
    flex: 0 0 20px;
    background-color: #012596;
    display: flex;
    align-items: center;
    width: 100%;
    overflow: hidden;
}

.retweet {
    width: 40px;
    height: 100%;
    background-color: #088f8f;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: white;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
}

.retweet i {
    font-size: 12px;
    display: flex;
    align-items: center;
}

.retweet span {
    display: inline-block;
    padding-bottom: 3px;
}

.outline-right {
    margin-left: auto;
    padding-right: 10px;
    height: 100%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    cursor: pointer;
}

.outline-right i {
    font-size: 12px;
    line-height: 1;
    display: flex;
}
</style>