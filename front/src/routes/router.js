import WallPage from "../pages/Wall/WallPage.vue"
import LoginPage from "../pages/LoginPage.vue"
import ProfilePage from "../pages/ProfilePage.vue"
import AllProfilePage from "../pages/AllProfilePage.vue"
import EditProfile from "../pages/EditProfile.vue"
import { createRouter, createWebHistory } from "vue-router"

const routes = [
    { path: "/login", component: LoginPage },
    { path: "/home", component: WallPage },
    { path: "/profile", component: ProfilePage },
    { path: "/all-profile", component: AllProfilePage },
    { path: "/edit-profile", component: EditProfile},
    { path: "/", redirect: "/home" },
]
const router = createRouter({ history: createWebHistory(), routes })

export { router }