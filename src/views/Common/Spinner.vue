<template>
    <div>
        <div class="spinner"></div>
    </div>
</template>

<script>
export default {
    name : "spinner"
}
</script>

<style>

.spinner {
    width: 20px;
    height: 20px;
    border: 5px solid #ccc;
    border-top: 5px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>