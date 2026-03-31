// ============================================================
// 创建旅行页 - 旅行创建表单，提交后跳转到旅行详情
// 路由：/trip/new
// 验证需求：1.1, 1.2, 1.3, 1.4
// ============================================================

import { Link, useNavigate } from 'react-router-dom';
import TripForm from '../components/TripForm';
import { useAppContext } from '../context/AppContext';
import type { CreateTripInput } from '../types';
import { createTrip } from '../utils/tripManager';
import styles from './CreateTripPage.module.css';

export default function CreateTripPage() {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();

  /** 处理表单提交：创建旅行并跳转到详情页 */
  const handleSubmit = (input: CreateTripInput) => {
    // 调用 createTrip 创建旅行记录
    const result = createTrip(input);

    if (!result.ok) {
      // 验证失败不应到达此处（TripForm 已做前端验证），但做防御处理
      return;
    }

    // 派发 ADD_TRIP action 将旅行添加到全局状态
    dispatch({ type: 'ADD_TRIP', payload: result.value });

    // 跳转到新创建的旅行详情页
    navigate(`/trip/${result.value.id}`);
  };

  return (
    <div className={styles.page}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}>
          ← 返回
        </Link>
        <h1 className={styles.title}>创建旅行</h1>
      </div>

      {/* 旅行创建表单 */}
      <div className={styles.formCard}>
        <TripForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
