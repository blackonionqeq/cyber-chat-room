<template>
	
	<NDropdown :show="showContextMenu" :x="x" :y="y" :on-clickoutside="clickMenuOutside" @select="$event => {emit('selectMenu', $event);showContextMenu = false}" trigger="manual" :options></NDropdown>
</template>

<script lang="ts" setup>
import { NDropdown } from 'naive-ui/es';
import { nextTick, ref } from 'vue';


const props = defineProps({
	options: {
		type: Array as () => { key: string, label: string }[],
		required: true,
	},
})
const emit = defineEmits<{
	selectMenu: [key: string]
}>()

function showMenu(e: MouseEvent) {
	e.preventDefault()
	showContextMenu.value = false
	nextTick(() => {
		x.value = e.clientX
		y.value = e.clientY
		showContextMenu.value = true
	})
}
defineExpose({
	showMenu,
})

const showContextMenu = ref(false)
const x = ref(0)
const y = ref(0)
function clickMenuOutside() {
	showContextMenu.value = false
}
const menuOptions = [
	{ key: 'favorite', label: '收藏' }
]
</script>