<template>
  <HeaderVue/>
  <HeroComponent/>
  <AboutUsComponent/>
</template>

<script>

import AboutUsComponent from "./AboutUsComponent.vue";
import HeaderVue from "./HeaderVue";
import HeroComponent from "./HeroComponent.vue";
export default {
  name: 'LandingPage',
  components:{ HeaderVue, HeroComponent, AboutUsComponent },
  data: () => {
  },
}
</script>
