<template>
  <q-layout view="hHh LpR fFf" class="bg-grey-2">
    <q-header class="bg-primary text-white">
      <q-toolbar style="height: 80px;">
        <q-toolbar-title class="q-ml-lg text-bold">
          <q-img
            :src="'/undraw/interm-32.png'"
            spinner-size="32px"
            style="height: 32px; max-width: 32px"
            class="q-mr-sm"
          />
          INTERM
        </q-toolbar-title>

        <q-btn
          flat
          round
          dense
          icon="assignment_ind"
        >
          <q-menu>
            <q-list style="min-width: 170px">
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon :name="'logout'" />
                </q-item-section>

                <q-item-section>
                  Sair
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        {{ nameUserAuth }}

      </q-toolbar>
    </q-header>

      <q-drawer
        v-model="drawer"
        show-if-above
        :mini="miniState"
        @mouseenter="miniState = false"
        @mouseleave="miniState = true"
        :width="310"
        :mini-width="88"
        :breakpoint="599"
        bordered
        :class="$q.dark.isActive ? 'bg-primary' : 'bg-primary'"
      >
        <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: '0' }">
          <q-list padding>
            <q-item clickable v-ripple :to="{name: 'home'}" class="q-mt-sm">
              <q-item-section avatar>
                <q-icon name="home" color="white"/>
              </q-item-section>

              <q-item-section class="text-white text-bold">
                Home
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{name: 'processos'}" class="q-mt-sm">
              <q-item-section avatar>
                <q-icon name="work" color="white"/>
              </q-item-section>

              <q-item-section class="text-white text-bold">
                Processos
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{name: 'clientes'}" class="q-mt-sm">
              <q-item-section avatar>
                <q-icon name="group" color="white"/>
              </q-item-section>

              <q-item-section class="text-white text-bold">
                Clientes
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{name: 'pastas'}" class="q-mt-sm">
              <q-item-section avatar>
                <q-icon name="folders" color="white" />
              </q-item-section>

              <q-item-section class="text-white text-bold">
                Documentos
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>

    <q-page-container>
      <div class="q-pa-lg q-mx-auto" style="max-width: 1200px;">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>
<script setup lang="ts">
import { useNotification } from '@/composables/useNotification';
import { useAuthService } from '@/services/api/auth.service';
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router';

const authService = useAuthService()
const notification = useNotification()
const router = useRouter()

const drawer = ref(false);
const miniState = ref(true);
const nameUserAuth = ref('Bem Vindo!')

onMounted(async () => {
  const response = await authService.refresh()
  nameUserAuth.value = response.user.nome
})

function logout(){
  try {
    authService.logout()
    router.push({ name: 'login'})
  } catch (error) {
    notification.error('Erro ao fazer logout: ');
    console.error(error)
  }
}
</script>