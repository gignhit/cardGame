<template>
    <div>
        <div>
            <div>user_id</div>
            <input v-model.number = "user_id"/>
            <div>game_id</div>
            <input v-model.number = "game_id"/><br/>
            <div>bet</div>
            <input v-model.number = "bet"/><br/>
            <button @click="create()"> create game </button>
            <button @click="start()"> start game </button>
            <button @click="join()"> join </button>
            <button @click="doBet()"> bet </button>
            <button @click="check()"> check </button>
            <button @click="raise()"> raise </button>
            <button @click="call()"> call </button>
            <button @click="pass()"> pass </button>
            <br>
            <button @click="getCombination(game_id, user_id)"> get combination </button>
            <button @click="getTable()"> get Table </button>
            <button @click="getUser()"> get user </button>
            <button @click="subscribe(game_id)"> resubscribe </button>

        </div>

        <h1>game logs</h1>
        <div>
            <div v-for="(message, index) in messages" :key="index">
                <p>{{ message }}</p>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import axios from 'axios';
import { ref, type Ref } from 'vue';

let messages :Ref<any[]> = ref([]);

let user_id = ref(1);
let game_id = ref(1);
let bet = ref(1);

function start(){
    axios.post('http://localhost:3000/poker/start', {
        game_id: game_id.value,
    })
}

function create(){
    axios.post('http://localhost:3000/poker/create')
        .then( res => {
            game_id.value = res.data
        });
}

function join(){
    axios.post('http://localhost:3000/poker/join', {
        game_id: game_id.value,
        user_id: user_id.value
    })
    .then( res => {
        subscribe(game_id.value);
    })
}

function doBet(){
    axios.post('http://localhost:3000/poker/action', {
        game_id: game_id.value,
        user_id: user_id.value,
        action: 'bet',
        bet: bet.value,
    })
}

function check(){
    axios.post('http://localhost:3000/poker/action', {
        game_id: game_id.value,
        user_id: user_id.value,
        action: 'check',
        bet: null,
    })
}

function raise(){
    axios.post('http://localhost:3000/poker/action', {
        game_id: game_id.value,
        user_id: user_id.value,
        action: 'raise',
        bet: bet.value,
    })
}

function call(){
    axios.post('http://localhost:3000/poker/action', {
        game_id: game_id.value,
        user_id: user_id.value,
        action: 'call',
        bet: null,
    })
}

function pass(){
    axios.post('http://localhost:3000/poker/action', {
        game_id: game_id.value,
        user_id: user_id.value,
        action: 'pass',
        bet: null,
    })
}

async function subscribe(id :number){
    try {
        let res = await axios.post('http://localhost:3000/poker/subscribe-poker', {
            game_id: id
        });
        messages.value.push(res.data);
        console.log(res.data);
        await subscribe(id);
    } catch (e) {
        setTimeout(() => {
            subscribe(id);
        }, 100)
    }
}

function getCombination(game_id :number, user_id :number){
    axios
        .get(`http://localhost:3000/poker/combination?game_id=${game_id}&user_id=${user_id}`)
        .then(res => {
            console.log(res.data);
            messages.value.push(res.data);
        })
}

function getTable(){
    axios
        .get(`http://localhost:3000/poker/table?game_id=${game_id.value}`)
        .then(res => {
            console.log(res.data);
            messages.value.push(res.data);
        })
}

function getUser(){
    axios
        .get(`http://localhost:3000/poker/user?game_id=${game_id.value}&user_id=${user_id.value}`)
        .then(res => {
            console.log(res.data);
            messages.value.push(res.data);
        })
}

</script>

<style>
    #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
    }
</style>
  