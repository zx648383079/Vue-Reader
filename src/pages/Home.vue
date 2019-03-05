<template>
    <div>
        
        <TabBar/>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TabBar from '@/components/TabBar.vue';

@Component({
  components: {
    TabBar,
  },
})
export default class Home extends Vue {}
</script>
