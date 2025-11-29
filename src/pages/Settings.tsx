import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LocalStorageService } from '@/utils/storage';
import { GameSettings, GameMode } from '@/types/game';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<GameSettings>(LocalStorageService.getDefaultSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = LocalStorageService.loadSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const handleSave = () => {
    LocalStorageService.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings(LocalStorageService.getDefaultSettings());
  };

  const handleChange = (key: keyof GameSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回游戏
          </Link>
          <h1 className="text-3xl font-bold text-white">游戏设置</h1>
          <div className="w-20"></div>
        </div>

        {/* 设置面板 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 小球设置 */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">小球设置</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  小球颜色
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.targetColor}
                    onChange={(e) => handleChange('targetColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-600 bg-gray-800"
                  />
                  <span className="text-gray-400">{settings.targetColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  小球大小: {settings.targetSize.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.1"
                  value={settings.targetSize}
                  onChange={(e) => handleChange('targetSize', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  生成密度: {settings.spawnDensity}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={settings.spawnDensity}
                  onChange={(e) => handleChange('spawnDensity', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  移动速度: {settings.moveSpeed}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.5"
                  value={settings.moveSpeed}
                  onChange={(e) => handleChange('moveSpeed', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* 准星设置 */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">准星设置</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  准星颜色
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.crosshairColor}
                    onChange={(e) => handleChange('crosshairColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-600 bg-gray-800"
                  />
                  <span className="text-gray-400">{settings.crosshairColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  准星大小: {settings.crosshairSize}
                </label>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="2"
                  value={settings.crosshairSize}
                  onChange={(e) => handleChange('crosshairSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  准星粗细: {settings.crosshairThickness}
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={settings.crosshairThickness}
                  onChange={(e) => handleChange('crosshairThickness', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* 游戏模式 */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">游戏模式</h2>
            <div className="grid grid-cols-3 gap-4">
              {Object.values(GameMode).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleChange('gameMode', mode)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.gameMode === mode
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
                      : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">
                    {mode === 'fixed' && '固定模式'}
                    {mode === 'mixed' && '混合模式'}
                    {mode === 'random' && '随机模式'}
                  </div>
                  <div className="text-sm mt-1 opacity-75">
                    {mode === 'fixed' && '小球不移动'}
                    {mode === 'mixed' && '固定+移动混合'}
                    {mode === 'random' && '全部随机移动'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
            >
              <Save className="w-4 h-4" />
              {saved ? '已保存' : '保存设置'}
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              重置默认
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
