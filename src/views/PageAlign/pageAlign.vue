<template>
    <div class="pageAlign" style="height: 30px;display: flex;align-items: center;justify-content: center; margin-bottom: 10px;">
        <p @click="firstUserPage()" style="margin-right: 10px;"><i class="fa-solid fa-angles-left"></i></p>
        <p @click="previousUser()"><i class="fa-solid fa-circle-chevron-left"></i></p>
        <p :id="'firstUserPage' + title"  @click="firstUser()" style="margin-left: 5px;"> {{ pageUser.first }} </p>
        <p :id="'secondUserPage' + title" v-if="displayPageUser.second" @click="secondUser()" style="margin-left: 5px;"> {{ pageUser.second }} </p>
        <p :id="'thirdUserPage' + title" v-if="displayPageUser.third" @click="thirdUser()" style="margin-left: 5px;"> {{ pageUser.third }} </p>
        <p :id="'dotUserPage' + title" v-if="displayPageUser.dot" @click="dotUser()" style="margin-left: 5px;"> {{ pageUser.dot }} </p>
        <p :id="'endUserPage' + title" v-if="displayPageUser.end" @click="endUser()" style="margin-left: 5px;"> {{ pageUser.end }} </p>
        <p @click="nextUser()" style="margin-left: 5px;"><i class="fa-solid fa-circle-chevron-right"></i></p>
        <p @click="endPageUser()" style="margin-left: 10px;"><i class="fa-solid fa-angles-right"></i></p>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name : "PageAlign",
    props: {
        title: String,
        pageUser : Object,
        displayPageUser : Object,
        pageUserInstance : Object,
        currentPage : Object,
        option : Object
    },
    data() {
        return {
        }
    },
    watch: {
        "currentPage.current" : {
            handler(newValue, oldValue) {
                this.$emit('update-page', this.currentPage.current)
            },
            deep: true,
            immediate : true
        }
    },
    methods: {
        firstUserPage() {
            this.pageUserInstance.first = document.getElementById("firstUserPage" + this.title);
            this.pageUserInstance.second = document.getElementById("secondUserPage" + this.title);
            this.pageUserInstance.third = document.getElementById("thirdUserPage" + this.title);
            this.pageUserInstance.dot = document.getElementById("dotUserPage" + this.title);
            this.pageUserInstance.end = document.getElementById("endUserPage" + this.title);

            for(let i in Object.keys(this.pageUserInstance)) {
                if(this.pageUserInstance[Object.keys(this.pageUserInstance)[i]] != null) {
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['backgroundColor'] = 'white'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['color'] = 'black'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['fontWeight'] = ''
                }
            }
            
            this.pageUserInstance.first.style.backgroundColor = "black"
            this.pageUserInstance.first.style.color = "white"
            this.pageUserInstance.first.style.fontWeight = "bold"

            this.pageUser.first = 1
            this.pageUser.second = 2
            this.pageUser.third = 3
            this.pageUser.dot = "..."

            this.currentPage.nextP = "second"
            this.currentPage.previousP = ''
            this.currentPage.current = JSON.parse(JSON.stringify(this.pageUser.first))

            if(this.pageUser.end <= 4) {
                this.displayPageUser.dot = false
            } else {
                this.displayPageUser.dot = true
            }

            this.option.mode = 'update'
        },
        previousUser() {
            if(this.currentPage.previousP != '') {
                if(this.currentPage.previousP == 'first') {    
                    this.firstUser()
                } else if(this.currentPage.previousP == 'second') {
                    this.secondUser()
                } else if(this.currentPage.previousP == 'third') {
                    this.thirdUser()
                } else if(this.currentPage.previousP == 'dot') {
                    this.thirdUser()
                }
            } else {
                if(this.pageUser.first != 1) {
                    this.pageUser.first = this.pageUser.first - 1
                    this.pageUser.second = this.pageUser.second - 1
                    this.pageUser.third = this.pageUser.third - 1
                    if(this.displayPageUser.dot == false) {
                        this.displayPageUser.dot = true
                    }
                }
            }
            this.option.mode = 'update'
        },
        firstUser() {
            this.pageUserInstance.first = document.getElementById("firstUserPage" + this.title);
            this.pageUserInstance.second = document.getElementById("secondUserPage" + this.title);
            this.pageUserInstance.third = document.getElementById("thirdUserPage" + this.title);
            this.pageUserInstance.dot = document.getElementById("dotUserPage" + this.title);
            this.pageUserInstance.end = document.getElementById("endUserPage" + this.title);

            for(let i in Object.keys(this.pageUserInstance)) {
                if(this.pageUserInstance[Object.keys(this.pageUserInstance)[i]] != null) {
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['backgroundColor'] = 'white'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['color'] = 'black'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['fontWeight'] = ''
                }
            }
            
            this.pageUserInstance.first.style.backgroundColor = "black"
            this.pageUserInstance.first.style.color = "white"
            this.pageUserInstance.first.style.fontWeight = "bold"

            this.currentPage.nextP = "second"
            this.currentPage.previousP = ''
            this.currentPage.current = JSON.parse(JSON.stringify(this.pageUser.first))
            this.option.mode = 'update'
        },
        secondUser() {
            this.pageUserInstance.first = document.getElementById("firstUserPage" + this.title);
            this.pageUserInstance.second = document.getElementById("secondUserPage" + this.title);
            this.pageUserInstance.third = document.getElementById("thirdUserPage" + this.title);
            this.pageUserInstance.dot = document.getElementById("dotUserPage" + this.title);
            this.pageUserInstance.end = document.getElementById("endUserPage" + this.title);

            for(let i in Object.keys(this.pageUserInstance)) {
                if(this.pageUserInstance[Object.keys(this.pageUserInstance)[i]] != null) {
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['backgroundColor'] = 'white'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['color'] = 'black'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['fontWeight'] = ''
                }
            }
            
            this.pageUserInstance.second.style.backgroundColor = "black"
            this.pageUserInstance.second.style.color = "white"
            this.pageUserInstance.second.style.fontWeight = "bold"

            this.currentPage.nextP = "third"
            this.currentPage.previousP = 'first'
            this.currentPage.current = JSON.parse(JSON.stringify(this.pageUser.second))
            this.option.mode = 'update'
        },
        thirdUser() {
            this.pageUserInstance.first = document.getElementById("firstUserPage" + this.title);
            this.pageUserInstance.second = document.getElementById("secondUserPage" + this.title);
            this.pageUserInstance.third = document.getElementById("thirdUserPage" + this.title);
            this.pageUserInstance.dot = document.getElementById("dotUserPage" + this.title);
            this.pageUserInstance.end = document.getElementById("endUserPage" + this.title);

            for(let i in Object.keys(this.pageUserInstance)) {
                if(this.pageUserInstance[Object.keys(this.pageUserInstance)[i]] != null) {
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['backgroundColor'] = 'white'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['color'] = 'black'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['fontWeight'] = ''
                }
            }
            
            this.pageUserInstance.third.style.backgroundColor = "black"
            this.pageUserInstance.third.style.color = "white"
            this.pageUserInstance.third.style.fontWeight = "bold"

            this.currentPage.nextP = "dot"
            this.currentPage.previousP = 'second'
            this.currentPage.current = JSON.parse(JSON.stringify(this.pageUser.third))
            this.option.mode = 'update'
        },
        dotUser() {
            this.pageUserInstance.first = document.getElementById("firstUserPage" + this.title);
            this.pageUserInstance.second = document.getElementById("secondUserPage" + this.title);
            this.pageUserInstance.third = document.getElementById("thirdUserPage" + this.title);
            this.pageUserInstance.dot = document.getElementById("dotUserPage" + this.title);
            this.pageUserInstance.end = document.getElementById("endUserPage" + this.title);

            for(let i in Object.keys(this.pageUserInstance)) {
                if(this.pageUserInstance[Object.keys(this.pageUserInstance)[i]] != null) {
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['backgroundColor'] = 'white'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['color'] = 'black'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['fontWeight'] = ''
                }
            }
            
            this.pageUserInstance.dot.style.backgroundColor = "black"
            this.pageUserInstance.dot.style.color = "white"
            this.pageUserInstance.dot.style.fontWeight = "bold"

            this.pageUser.first = this.pageUser.first + 1
            this.pageUser.second = this.pageUser.second + 1
            this.pageUser.third = this.pageUser.third + 1
            if((this.pageUser.third + 1) == this.pageUser.end) {
                this.displayPageUser.dot = false
            }

            this.currentPage.nextP = "end"
            this.currentPage.previousP = 'third'

            this.option.mode = 'update'
        },
        endUser() {
            this.pageUserInstance.first = document.getElementById("firstUserPage" + this.title);
            this.pageUserInstance.second = document.getElementById("secondUserPage" + this.title);
            this.pageUserInstance.third = document.getElementById("thirdUserPage" + this.title);
            this.pageUserInstance.dot = document.getElementById("dotUserPage" + this.title);
            this.pageUserInstance.end = document.getElementById("endUserPage" + this.title);

            for(let i in Object.keys(this.pageUserInstance)) {
                if(this.pageUserInstance[Object.keys(this.pageUserInstance)[i]] != null) {
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['backgroundColor'] = 'white'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['color'] = 'black'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['fontWeight'] = ''
                }
            }
            
            this.pageUserInstance.end.style.backgroundColor = "black"
            this.pageUserInstance.end.style.color = "white"
            this.pageUserInstance.end.style.fontWeight = "bold"

            this.currentPage.nextP = ""
            this.currentPage.previousP = 'dot'
            this.currentPage.current = JSON.parse(JSON.stringify(this.pageUser.end))

            this.displayPageUser.dot = false
            this.pageUser.third = this.pageUser.end - 1
            this.pageUser.second = this.pageUser.end - 2
            this.pageUser.first = this.pageUser.end - 3
            this.option.mode = 'update'
        },
        nextUser() {
            if(this.pageUser.end <= 4) {
                if(this.currentPage.nextP == 'second') {
                    if(this.displayPageUser.second == true) {
                        this.secondUser()
                    }
                } else if(this.currentPage.nextP == 'third') {
                    if(this.displayPageUser.third == true) {
                        this.thirdUser()
                    }
                } else if(this.currentPage.nextP == 'dot') {
                    if(this.displayPageUser.end == true) {
                        this.endUser()
                    }
                }
            } else if(this.pageUser.end > 4) {
                if(this.currentPage.nextP == 'second') {
                    if(this.displayPageUser.second == true) {
                        this.secondUser()
                    }
                } else if(this.currentPage.nextP == 'third') {
                    if(this.displayPageUser.third == true) {
                        this.thirdUser()
                    }
                } else if(this.currentPage.nextP == 'dot') {
                    this.dotUser()
                    this.thirdUser()
                    if(this.displayPageUser.dot == false) {
                        this.currentPage.nextP = "end"
                        this.currentPage.previousP = 'third'
                    }
                } else if(this.currentPage.nextP == 'end') {
                    this.endUser()
                }
            }
            this.option.mode = 'update'
        },
        endPageUser() {
            if(this.pageUser.end >= 4) {
                this.endUser()
            } else {
                if(this.displayPageUser.third == true) {
                    this.thirdUser()
                } else {
                    if(this.displayPageUser.second == true) {
                        this.secondUser()
                    } else {
                        this.firstUser()
                    }
                }
            }
            this.option.mode = 'update'
        },
        firstUserPageNoMode() {
            this.pageUserInstance.first = document.getElementById("firstUserPage" + this.title);
            this.pageUserInstance.second = document.getElementById("secondUserPage" + this.title);
            this.pageUserInstance.third = document.getElementById("thirdUserPage" + this.title);
            this.pageUserInstance.dot = document.getElementById("dotUserPage" + this.title);
            this.pageUserInstance.end = document.getElementById("endUserPage" + this.title);

            for(let i in Object.keys(this.pageUserInstance)) {
                if(this.pageUserInstance[Object.keys(this.pageUserInstance)[i]] != null) {
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['backgroundColor'] = 'white'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['color'] = 'black'
                    this.pageUserInstance[Object.keys(this.pageUserInstance)[i]]['style']['fontWeight'] = ''
                }
            }
            
            this.pageUserInstance.first.style.backgroundColor = "black"
            this.pageUserInstance.first.style.color = "white"
            this.pageUserInstance.first.style.fontWeight = "bold"

            this.pageUser.first = 1
            this.pageUser.second = 2
            this.pageUser.third = 3
            this.pageUser.dot = "..."

            this.currentPage.nextP = "second"
            this.currentPage.previousP = ''
            this.currentPage.current = JSON.parse(JSON.stringify(this.pageUser.first))

            if(this.pageUser.end <= 4) {
                this.displayPageUser.dot = false
            } else {
                this.displayPageUser.dot = true
            }
            this.option.mode = "mode"
        },
    }
}
</script>
<style lang="scss">
.pageAlign {
    p {
        cursor: pointer;
        padding: 1px;
    }
    p:hover {
        font-weight: bold;
        background-color: black;
        color: white;
    }
}
</style>