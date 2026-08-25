export const SERVICE_DISCLAIMER =
  "核验结果补充免责声明：本次服务提供的核验结果基于当前数据生成，可能存在滞后，仅供初步参考。关于作品/软件版权权属或登记状态的最终确认，请以您办理的中国版权保护中心著作权登记查询业务出具的官方查询结果为准。";

/** 产品页底部免责声明 */
export function ServiceDisclaimer() {
  return (
    <p className="c-service-disclaimer">
      ※ {SERVICE_DISCLAIMER}
    </p>
  );
}
