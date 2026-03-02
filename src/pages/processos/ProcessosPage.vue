<template>
    <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Processos</h4>
        <p class="text-terciary q-my-none">Gerencie seus processos</p>
      </div>
      <q-btn
        color="secondary"
        icon="add_circle"
        label="Novo Processo"
        style="max-width: 200px;"
        :to="{ name: 'processo-form' }"
      />
    </div>
  </div>
</template>