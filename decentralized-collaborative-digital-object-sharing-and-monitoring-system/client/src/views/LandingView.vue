<template>
  <Landing />
</template>

<script>
import { defineComponent } from 'vue';


// Components
import Landing from '../components/Landing.vue';

export default defineComponent({
  name: 'HomeView',

  components: {
    Landing
},
});
</script>

    HeroComponent