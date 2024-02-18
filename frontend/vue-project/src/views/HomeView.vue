<template>
  <main>
    <div id="chat_container" style="position: relative;">
      <div
        v-for="(chat, i) in wrapper"
        :key="i"
        class="wrapper"
        :class="{ ai: chat.isAi }"
      >
        <Chat :chat="chat" :key="i" />
      </div>
    </div>
    <form @submit.prevent="fetchAnswer" class="footer-form">
      <textarea
        rows="1"
        cols="1"
        placeholder="Hii, Ask me anything!"
        v-model="question"
        style="width: calc(60% - 100px); height: 120px; padding: 10px; box-sizing: border-box; text-align: left; vertical-align: bottom;"
      ></textarea>
      <button type="submit" style="width: 100px; height: 120px; border: 3px dotted #000; cursor: pointer;">
        <img src="@/assets/ask.svg" alt="ask" style="width: 80px; height: 100px;" />
      </button>
    </form>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import Chat from '@/components/Chat.vue';

const question = ref('');
const wrapper = ref([]);
const loading = ref(false);

const fetchAnswer = async () => {
  try {
    loading.value = true;
    wrapper.value.push({
      isAi: false,
      value: question.value,
    });
    wrapper.value.push({
      isAi: true,
      value: "Please wait while I process your request...",
    });
    const res = await fetch('http://localhost:8000/', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question.value,
      }),
    });
    const data = await res.json();
    let result = data.bot.trim();
    //const result = typeof data.bot === 'string' ? data.bot.trim() : data.bot;

    // Manual line wrap
    const maxLength = 66;
    let parsedData = '';
    let cnt = 0;
    for (let i = 0; i < result.length; i++) {
      parsedData += result[i];
      cnt++;
      if (result[i] === '\n' || cnt === maxLength) {
        parsedData += '\n';
        cnt = 0;
      }
    }
    console.log(question.value);
    console.log(result);
    wrapper.value.pop();
    wrapper.value.push({
      isAi: true,
      value: parsedData,
    });
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
    question.value = '';
  }
};


/*second section that I'm not sure about*/ 


</script>

<style>
.wrapper {
  position: relative;
  border: 1px dotted #ccc; 
  padding: 30px;
  margin-top: 20px;
  text-align: left;
}

main {
  position: relative;
  height: 96vh; 
}

#chat_container {
  position: absolute;
  top: 0;
  left: 0;
  width: 600px; 
  height: calc(100% - 120px); 
  overflow: auto; 
}

.footer-form {
  position: relative;
  bottom: 0;
  left: 0;
  width: 1000px; 
  height: 120px; 
  padding: 10px;
}
</style>
