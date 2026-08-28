import type { ReactNode } from "react";
import {
  BUSINESS_TYPE_OPTIONS,
  USAGE_CHANNEL_OPTIONS,
  type BusinessType,
  type UsageChannel,
} from "@/lib/catalog";
import { toggleBusinessType, toggleUsageChannel } from "@/lib/productConfig";

type EditProps = {
  readonly?: false;
  businessTypes: BusinessType[];
  usageChannels: UsageChannel[];
  onChange: (patch: {
    businessTypes?: BusinessType[];
    usageChannels?: UsageChannel[];
  }) => void;
};

type ReadonlyProps = {
  readonly: true;
  businessTypes: BusinessType[];
  usageChannels: UsageChannel[];
};

type Props = EditProps | ReadonlyProps;

function formatLabels<T extends string>(
  codes: T[],
  options: readonly { code: T; label: string }[],
) {
  if (codes.length === 0) return "—";
  const map = new Map(options.map((o) => [o.code, o.label]));
  return codes.map((c) => map.get(c) ?? c).join("、");
}

export function ProductVerifyOptions(props: Props) {
  const { businessTypes, usageChannels, readonly } = props;

  return (
    <div className="a-product-subparams">
      <SubparamRow
        label="开通业务类型"
        required={!readonly}
        control={
          readonly ? (
            <span className="a-product-subparams__value">
              {formatLabels(businessTypes, BUSINESS_TYPE_OPTIONS)}
            </span>
          ) : (
            <CheckboxGroup
              options={BUSINESS_TYPE_OPTIONS}
              checked={businessTypes}
              onToggle={(code) =>
                props.onChange({
                  businessTypes: toggleBusinessType(businessTypes, code),
                })
              }
            />
          )
        }
      />
      <SubparamRow
        label="产品使用方式"
        required={!readonly}
        control={
          readonly ? (
            <span className="a-product-subparams__value">
              {formatLabels(usageChannels, USAGE_CHANNEL_OPTIONS)}
            </span>
          ) : (
            <CheckboxGroup
              options={USAGE_CHANNEL_OPTIONS}
              checked={usageChannels}
              onToggle={(code) =>
                props.onChange({
                  usageChannels: toggleUsageChannel(usageChannels, code),
                })
              }
            />
          )
        }
      />
    </div>
  );
}

function SubparamRow({
  label,
  required,
  control,
}: {
  label: string;
  required?: boolean;
  control: ReactNode;
}) {
  return (
    <div className="a-product-subparams__row">
      <span className="a-product-subparams__label">
        {label}
        {required ? <span className="a-req"> *</span> : null}
      </span>
      <div className="a-product-subparams__control">{control}</div>
    </div>
  );
}

function CheckboxGroup<T extends string>({
  options,
  checked,
  onToggle,
}: {
  options: readonly { code: T; label: string }[];
  checked: T[];
  onToggle: (code: T) => void;
}) {
  return (
    <div className="a-product-subparams__checks">
      {options.map((option) => (
        <label key={option.code} className="a-radio">
          <input
            type="checkbox"
            checked={checked.includes(option.code)}
            onChange={() => onToggle(option.code)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

/** 表格内嵌：从「授权总量」列起展示附属参数，产品列保留树形引导线 */
export function ProductSubparamsRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <tr className="a-product-row-detail">
      <td className="a-product-row-detail__tree" aria-hidden="true">
        <span className="a-product-row-detail__branch" />
      </td>
      <td colSpan={colSpan} className="a-product-row-detail__content">
        {children}
      </td>
    </tr>
  );
}
