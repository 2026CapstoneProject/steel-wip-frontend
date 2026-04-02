export const WEB_OFFICE_NAV_ITEMS = [
  {
    key: "wip",
    label: "재고현황",
    icon: "inventory_2",
    path: "/office/wip",
  },
  {
    key: "scenario-group",
    label: "시나리오 (Scenario)",
    icon: "schema",
    children: [
      {
        key: "scenario-input",
        label: "LANTEK 결과 입력",
        icon: "edit_note",
        path: "/office/scenario/input",
      },
      {
        key: "scenario-history",
        label: "시나리오 생성 이력",
        icon: "history",
        path: "/office/scenario/creationhistory",
      },
      {
        key: "scenario-release-history",
        label: "현장 전송 이력",
        icon: "move_up",
        path: "/office/scenario/releasehistory",
      },
    ],
  },
  {
    key: "field-lookup",
    label: "현장 조회",
    icon: "location_on",
    path: "/office/field-lookup",
  },
];
