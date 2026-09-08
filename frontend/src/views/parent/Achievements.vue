<template>
  <div>

    <div>
      <!-- 预设成就库入口 -->
      <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-sm p-6 mb-8 border border-amber-100">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              🏅 预设成就库
              <span class="text-xs font-normal text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{{ totalPresetCount }} 个预设</span>
            </h2>
            <p class="text-sm text-gray-500 mt-1">八大分类 · 铜银金铂四档 · 勾选后一键批量导入，同名自动跳过</p>
          </div>
          <button
            @click="openPresetModal()"
            class="bg-amber-500 text-white px-5 py-2.5 rounded-lg hover:bg-amber-600 transition-colors font-medium shadow-sm"
          >
            浏览预设库并批量导入
          </button>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">
          <button
            v-for="cat in presetCategories"
            :key="cat.key"
            @click="openPresetModal(cat.key)"
            class="flex items-center gap-1.5 bg-white/80 hover:bg-white border border-amber-200/60 rounded-full px-3 py-1.5 text-sm text-gray-700 transition-colors"
          >
            <span>{{ cat.icon }}</span>
            <span>{{ cat.label }}</span>
            <span class="text-xs text-gray-400">{{ cat.presets.length }}</span>
          </button>
        </div>
      </div>

      <!-- 成就列表 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">成就列表</h2>
          <div class="flex items-center gap-2">
            <button
              @click="exportAchievements"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出
            </button>
            <button
              @click="showImportModal = true"
              class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              导入
            </button>
            <button
              @click="showAddModal = true"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加自定义成就
            </button>
          </div>
        </div>

        <div v-if="achievements.length === 0" class="text-center py-8 text-gray-500">
          暂无成就，点击上方按钮添加或使用快速添加
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="achievement in achievements"
            :key="achievement.id"
            class="p-4 bg-gray-50 rounded-xl"
          >
            <div class="flex items-start space-x-3">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-2xl">{{ achievement.iconUrl || '🏆' }}</span>
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-800">{{ achievement.name }}</h3>
                <p class="text-sm text-gray-500">{{ achievement.description }}</p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ achievement.conditionValue }}{{ achievement.conditionUnit }}
                </p>
                <p v-if="achievement.rewardPoints" class="text-xs text-green-600 mt-1">
                  奖励: {{ achievement.rewardPoints }} 积分
                </p>
                <button
                  @click="openAssignModal(achievement)"
                  class="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  赋予孩子
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 已赋予成就记录 -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">已赋予成就</h2>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">显示已撤销:</span>
            <button
              @click="showRevoked = !showRevoked"
              :class="[
                'w-12 h-6 rounded-full transition-colors relative',
                showRevoked ? 'bg-green-500' : 'bg-gray-300'
              ]"
            >
              <span
                :class="[
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  showRevoked ? 'translate-x-7' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>
        
        <div v-if="assignedAchievements.length === 0" class="text-center py-8 text-gray-500">
          暂无已赋予的成就
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="record in filteredAssignedAchievements"
            :key="record.id"
            :class="[
              'flex items-center justify-between p-4 rounded-xl transition-all',
              record.isRevoked ? 'bg-red-50 border border-red-100' : 'bg-gray-50'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                record.isRevoked ? 'bg-red-100' : 'bg-yellow-100'
              ]">
                <span class="text-xl">{{ record.achievement?.iconUrl || '🏆' }}</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">
                  {{ record.achievement?.name }}
                  <span v-if="record.isRevoked" class="ml-2 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">已撤销</span>
                </p>
                <p class="text-sm text-gray-500">
                  {{ record.displayName }} · {{ formatDate(record.completedAt) }}
                </p>
                <p v-if="record.achievement?.rewardPoints" class="text-xs text-green-600">
                  奖励: {{ record.achievement.rewardPoints }} 积分
                </p>
                <p v-if="record.isRevoked && record.revokeReason" class="text-xs text-red-500 mt-1">
                  撤销原因: {{ record.revokeReason }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span v-if="!record.isRevoked" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">已完成</span>
              <span v-else class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">已撤销</span>
              
              <!-- 撤销/恢复按钮 -->
              <button
                v-if="!record.isRevoked"
                @click="openRevokeModal(record)"
                class="text-red-600 hover:text-red-700 text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors"
              >
                撤销
              </button>
              <button
                v-else
                @click="restoreAchievement(record)"
                class="text-green-600 hover:text-green-700 text-sm px-3 py-1 rounded hover:bg-green-50 transition-colors"
              >
                恢复
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加成就弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4">添加成就</h3>
        <form @submit.prevent="addAchievement" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">成就名称</label>
            <input
              v-model="newAchievement.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="如：连续7天早起"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <input
              v-model="newAchievement.description"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="可选"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">图标</label>
            <div class="grid grid-cols-8 gap-2">
              <button
                v-for="icon in commonIcons"
                :key="icon"
                type="button"
                @click="newAchievement.iconUrl = icon"
                :class="[
                  'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors',
                  newAchievement.iconUrl === icon ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-50 hover:bg-gray-100'
                ]"
              >
                {{ icon }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">条件类型</label>
            <select
              v-model="newAchievement.conditionType"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="consecutive">连续天数</option>
              <option value="count">累计次数</option>
              <option value="accumulate">累计积分</option>
              <option value="streak">打卡火苗保持天数</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">目标值</label>
            <input
              v-model.number="newAchievement.conditionValue"
              type="number"
              required
              min="1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
            <input
              v-model="newAchievement.conditionUnit"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="如：天、次、小时"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">奖励积分</label>
            <input
              v-model.number="newAchievement.rewardPoints"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="完成成就后奖励的积分"
            />
          </div>
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showAddModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 赋予成就弹窗 -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4">赋予成就</h3>
        <p class="text-sm text-gray-600 mb-4">
          将成就 "{{ selectedAchievement?.name }}" 赋予孩子
        </p>
        <form @submit.prevent="assignAchievement" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">选择孩子</label>
            <select
              v-model="assignForm.userId"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option v-for="child in children" :key="child.id" :value="child.id">
                {{ child.displayName }}
              </option>
            </select>
          </div>
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showAssignModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              确认赋予
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 撤销成就弹窗 -->
    <div v-if="showRevokeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4">撤销成就</h3>
        <p class="text-sm text-gray-600 mb-4">
          确定要撤销成就 "{{ selectedRecord?.achievement?.name }}" 吗？
        </p>
        <p v-if="selectedRecord?.achievement?.rewardPoints" class="text-sm text-red-600 mb-4">
          警告：此成就包含 {{ selectedRecord.achievement.rewardPoints }} 积分奖励，撤销后将扣除相应积分
        </p>
        <form @submit.prevent="confirmRevokeAchievement" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">撤销原因（可选）</label>
            <textarea
              v-model="revokeForm.reason"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="请输入撤销原因..."
            ></textarea>
          </div>
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showRevokeModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              确认撤销
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 导入成就弹窗 -->
    <div v-if="showImportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4">导入成就配置</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">选择 JSON 文件</label>
            <input
              type="file"
              accept=".json"
              @change="onFileChange"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p class="text-xs text-gray-500 mt-1">支持从其他家庭导出的成就配置文件</p>
          </div>

          <div v-if="importPreview" class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm font-medium text-gray-700 mb-2">预览 ({{ importPreview.achievements?.length || 0 }} 条成就)</p>
            <div class="max-h-40 overflow-y-auto space-y-2">
              <div
                v-for="(item, index) in importPreview.achievements?.slice(0, 5)"
                :key="index"
                class="text-sm text-gray-600 flex items-center gap-2"
              >
                <span>{{ item.iconUrl || '🏆' }}</span>
                <span>{{ item.name }}</span>
              </div>
              <p v-if="(importPreview.achievements?.length || 0) > 5" class="text-xs text-gray-400">
                还有 {{ importPreview.achievements.length - 5 }} 条...
              </p>
            </div>
          </div>

          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showImportModal = false; importFile = null; importPreview = null"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              @click="confirmImport"
              :disabled="!importPreview || importLoading"
              class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ importLoading ? '导入中...' : '确认导入' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- 预设成就库批量导入弹窗 -->
    <div v-if="showPresetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <!-- 头部 -->
        <div class="p-6 pb-4 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-800">🏅 预设成就库</h3>
            <button @click="closePresetModal" class="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>
          <!-- 分类 tabs -->
          <div class="flex flex-wrap gap-2 mt-4">
            <button
              v-for="cat in presetCategories"
              :key="cat.key"
              @click="presetTab = cat.key"
              :class="[
                'px-3 py-1.5 rounded-full text-sm transition-colors border',
                presetTab === cat.key
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              ]"
            >
              {{ cat.icon }} {{ cat.label }}
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-2">{{ activeCategory?.description }}</p>
        </div>

        <!-- 列表（可滚动） -->
        <div class="flex-1 overflow-y-auto p-6 pt-4">
          <div class="flex items-center justify-between mb-3">
            <button @click="toggleSelectAllInTab" class="text-sm text-amber-600 hover:text-amber-700 font-medium">
              {{ isAllSelectedInTab ? '取消全选本类' : '全选本类' }}
            </button>
            <p class="text-xs text-gray-400">已选 {{ selectedPresetNames.size }} 个</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              v-for="preset in activeCategory?.presets || []"
              :key="preset.name"
              :class="[
                'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                existingNames.has(preset.name)
                  ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                  : selectedPresetNames.has(preset.name)
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-white border-gray-200 hover:border-amber-200'
              ]"
            >
              <input
                type="checkbox"
                :checked="selectedPresetNames.has(preset.name)"
                :disabled="existingNames.has(preset.name)"
                @change="togglePreset(preset.name)"
                class="mt-1 accent-amber-500"
              />
              <span class="text-2xl">{{ preset.icon }}</span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="text-sm font-medium text-gray-800">{{ preset.name }}</p>
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    :style="{ color: tierMeta[preset.tier].color, background: tierMeta[preset.tier].bg }"
                  >
                    {{ tierMeta[preset.tier].label }} · +{{ preset.rewardPoints }}
                  </span>
                  <span v-if="existingNames.has(preset.name)" class="text-[10px] text-gray-400">已添加</span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5">{{ preset.description }}</p>
                <p class="text-[11px] text-gray-400 mt-0.5">{{ presetConditionText(preset) }}</p>
              </div>
            </label>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="p-6 pt-4 border-t border-gray-100 flex items-center gap-3">
          <p class="text-sm text-gray-500 flex-1">
            共选 <span class="font-bold text-amber-600">{{ selectedPresetNames.size }}</span> 个成就
            <span v-if="importResult" class="ml-2 text-green-600">{{ importResult }}</span>
          </p>
          <button
            @click="closePresetModal"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            关闭
          </button>
          <button
            @click="importSelectedPresets"
            :disabled="selectedPresetNames.size === 0 || presetImporting"
            class="px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ presetImporting ? '导入中...' : '一键导入所选' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { achievementApi, familyApi, achievementConfigApi } from '@/api';
import { presetCategories, allPresets, tierMeta } from '@/data/achievementPresets';

const authStore = useAuthStore();

const achievements = ref<any[]>([]);
const assignedAchievements = ref<any[]>([]);
const children = ref<any[]>([]);
const showAddModal = ref(false);
const showAssignModal = ref(false);
const showRevokeModal = ref(false);
const showRevoked = ref(false);
const showImportModal = ref(false);
const selectedAchievement = ref<any>(null);
const selectedRecord = ref<any>(null);
const importFile = ref<File | null>(null);
const importPreview = ref<any>(null);
const importLoading = ref(false);

const commonIcons = ['🏆', '🥇', '🥈', '🥉', '⭐', '💫', '🌟', '✨', '🎯', '🎖️', '🏅', '🌈', '🔥', '💪', '📚'];

/* ---------- 预设库批量导入 ---------- */
const showPresetModal = ref(false);
const presetTab = ref(presetCategories[0]!.key);
const selectedPresetNames = ref<Set<string>>(new Set());
const presetImporting = ref(false);
const importResult = ref('');

const totalPresetCount = allPresets.length;
const activeCategory = computed(() => presetCategories.find((c) => c.key === presetTab.value));
const existingNames = computed(() => new Set(achievements.value.map((a: any) => a.name)));
const isAllSelectedInTab = computed(() => {
  const presets = activeCategory.value?.presets || [];
  const selectable = presets.filter((p) => !existingNames.value.has(p.name));
  return selectable.length > 0 && selectable.every((p) => selectedPresetNames.value.has(p.name));
});

const openPresetModal = (tabKey?: string) => {
  if (tabKey) presetTab.value = tabKey;
  importResult.value = '';
  showPresetModal.value = true;
};

const closePresetModal = () => {
  showPresetModal.value = false;
};

const togglePreset = (name: string) => {
  if (selectedPresetNames.value.has(name)) {
    selectedPresetNames.value.delete(name);
  } else {
    selectedPresetNames.value.add(name);
  }
  selectedPresetNames.value = new Set(selectedPresetNames.value);
};

const toggleSelectAllInTab = () => {
  const presets = (activeCategory.value?.presets || []).filter(
    (p) => !existingNames.value.has(p.name)
  );
  const next = new Set(selectedPresetNames.value);
  if (isAllSelectedInTab.value) {
    presets.forEach((p) => next.delete(p.name));
  } else {
    presets.forEach((p) => next.add(p.name));
  }
  selectedPresetNames.value = next;
};

const presetConditionText = (preset: any) => {
  const map: Record<string, string> = {
    count: `累计获得积分 ${preset.conditionValue} 次`,
    accumulate: `累计获得 ${preset.conditionValue} 积分`,
    consecutive: `连续 ${preset.conditionValue} 天获得积分`,
    streak: `打卡火苗保持 ${preset.conditionValue} 天`,
  };
  return map[preset.conditionType] || `${preset.conditionValue}${preset.conditionUnit}`;
};

const importSelectedPresets = async () => {
  const selected = allPresets.filter((p) => selectedPresetNames.value.has(p.name));
  if (selected.length === 0) return;

  presetImporting.value = true;
  importResult.value = '';
  try {
    const res = await achievementConfigApi.importAchievements({
      achievements: selected.map((p) => ({
        name: p.name,
        description: p.description,
        iconUrl: p.icon,
        conditionType: p.conditionType,
        conditionValue: p.conditionValue,
        conditionUnit: p.conditionUnit,
        rewardPoints: p.rewardPoints,
      })),
      familyId: authStore.user?.familyId || 0,
    });
    if (res.success) {
      const skipped = selected.length - res.importedCount;
      importResult.value = `已导入 ${res.importedCount} 个${skipped > 0 ? `，跳过 ${skipped} 个同名` : ''}`;
      selectedPresetNames.value = new Set();
      fetchAchievements();
    } else {
      alert(res.error || '导入失败');
    }
  } catch (error) {
    console.error('批量导入失败:', error);
    alert('批量导入失败');
  } finally {
    presetImporting.value = false;
  }
};

const newAchievement = ref({
  name: '',
  description: '',
  iconUrl: '🏆',
  conditionType: 'consecutive' as 'consecutive' | 'count' | 'accumulate' | 'streak',
  conditionValue: 7,
  conditionUnit: '天',
  rewardPoints: 0,
});

const assignForm = ref({
  userId: 0,
  note: '',
});

const revokeForm = ref({
  reason: '',
});

const filteredAssignedAchievements = computed(() => {
  if (showRevoked.value) {
    return assignedAchievements.value;
  }
  return assignedAchievements.value.filter(a => !a.isRevoked);
});

const fetchAchievements = async () => {
  try {
    const response = await achievementApi.getAchievements({ familyId: authStore.user?.familyId }) as any;
    achievements.value = response.achievements || [];
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
  }
};

const fetchChildren = async () => {
  try {
    if (authStore.user?.familyId) {
      const response = await familyApi.getFamily(authStore.user.familyId) as any;
      children.value = (response.members || []).filter((m: any) => m.role === 'child');
    }
  } catch (error) {
    console.error('Failed to fetch children:', error);
  }
};

const fetchAssignedAchievements = async () => {
  try {
    const allAssigned: any[] = [];
    for (const child of children.value) {
      const response = await achievementApi.getUserAchievements(child.id, true) as any;
      const userAchievements = response.userAchievements || [];
      for (const ua of userAchievements) {
        allAssigned.push({
          ...ua,
          displayName: child.displayName,
          childId: child.id,
        });
      }
    }
    assignedAchievements.value = allAssigned;
  } catch (error) {
    console.error('Failed to fetch assigned achievements:', error);
  }
};

const addAchievement = async () => {
  try {
    await achievementApi.createAchievement({
      familyId: authStore.user?.familyId,
      name: newAchievement.value.name,
      description: newAchievement.value.description,
      conditionType: newAchievement.value.conditionType,
      conditionValue: newAchievement.value.conditionValue,
      conditionUnit: newAchievement.value.conditionUnit,
      iconUrl: newAchievement.value.iconUrl,
      rewardPoints: newAchievement.value.rewardPoints,
    });
    showAddModal.value = false;
    newAchievement.value = { name: '', description: '', iconUrl: '🏆', conditionType: 'consecutive', conditionValue: 7, conditionUnit: '天', rewardPoints: 0 };
    fetchAchievements();
  } catch (error) {
    console.error('Failed to add achievement:', error);
    alert('添加成就失败');
  }
};

const openAssignModal = (achievement: any) => {
  selectedAchievement.value = achievement;
  assignForm.value = { userId: children.value[0]?.id || 0, note: '' };
  showAssignModal.value = true;
};

const assignAchievement = async () => {
  if (!selectedAchievement.value) return;
  try {
    await achievementApi.assignAchievement(selectedAchievement.value.id, {
      userId: assignForm.value.userId,
      note: assignForm.value.note,
    });
    showAssignModal.value = false;
    fetchAssignedAchievements();
    alert('成就赋予成功！');
  } catch (error) {
    console.error('Failed to assign achievement:', error);
    alert('赋予成就失败，可能该孩子已获得此成就');
  }
};

const openRevokeModal = (record: any) => {
  selectedRecord.value = record;
  revokeForm.value = { reason: '' };
  showRevokeModal.value = true;
};

const confirmRevokeAchievement = async () => {
  if (!selectedRecord.value) return;
  try {
    await achievementApi.revokeAchievement(selectedRecord.value.id, {
      revokedBy: authStore.user?.id || 0,
      reason: revokeForm.value.reason,
    });
    showRevokeModal.value = false;
    fetchAssignedAchievements();
    alert('成就已撤销，相应积分已扣除');
  } catch (error) {
    console.error('Failed to revoke achievement:', error);
    alert('撤销成就失败');
  }
};

const restoreAchievement = async (record: any) => {
  if (!confirm(`确定要恢复成就 "${record.achievement?.name}" 吗？`)) {
    return;
  }
  try {
    await achievementApi.restoreAchievement(record.id, {
      restoredBy: authStore.user?.id || 0,
    });
    fetchAssignedAchievements();
    alert('成就已恢复，相应积分已返还');
  } catch (error) {
    console.error('Failed to restore achievement:', error);
    alert('恢复成就失败');
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

// 导出成就
const exportAchievements = async () => {
  try {
    const response = await achievementConfigApi.exportAchievements(authStore.user?.familyId);
    const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `achievements-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    alert('导出成功！');
  } catch (error) {
    console.error('导出失败:', error);
    alert('导出失败');
  }
};

// 文件选择处理
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    importFile.value = target.files[0];
    previewImportFile();
  }
};

// 预览导入文件
const previewImportFile = () => {
  if (!importFile.value) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = JSON.parse(e.target?.result as string);
      importPreview.value = content;
    } catch (error) {
      alert('文件格式错误，请上传有效的JSON文件');
      importFile.value = null;
      importPreview.value = null;
    }
  };
  reader.readAsText(importFile.value);
};

// 确认导入
const confirmImport = async () => {
  if (!importPreview.value) return;

  importLoading.value = true;
  try {
    const res = await achievementConfigApi.importAchievements({
      achievements: importPreview.value.achievements || [],
      familyId: authStore.user?.familyId || 0,
    });
    if (res.success) {
      alert(`成功导入 ${res.importedCount} 条成就`);
      showImportModal.value = false;
      importFile.value = null;
      importPreview.value = null;
      fetchAchievements();
    } else {
      alert(res.error || '导入失败');
    }
  } catch (error) {
    console.error('导入失败:', error);
    alert('导入失败');
  } finally {
    importLoading.value = false;
  }
};

onMounted(() => {
  fetchAchievements();
  fetchChildren().then(() => {
    fetchAssignedAchievements();
  });
});
</script>
