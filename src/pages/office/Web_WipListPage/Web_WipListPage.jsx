import { useState } from "react";
import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_InventoryFilterSection from "../../../components/office/Web_InventoryFilterSection/Web_InventoryFilterSection";
import Web_InventoryTableSection from "../../../components/office/Web_InventoryTableSection/Web_InventoryTableSection";

const initialFilters = {
  qrNumber: "",
  manufacturer: "전체",
  material: "전체",
  thickness: "전체",
  widthMin: "",
  widthMax: "",
  lengthMin: "",
  lengthMax: "",
};

const mockRows = [
  {
    id: 1,
    qrNumber: "QR-8829-X01",
    manufacturer: "Hyundai Steel",
    material: "SS400",
    thickness: 12.0,
    width: 2438,
    length: 6096,
    weight: 1418,
    location: "A-4",
    layer: 1,
  },
  {
    id: 2,
    qrNumber: "QR-8829-X02",
    manufacturer: "POSCO",
    material: "SM490",
    thickness: 15.5,
    width: 3000,
    length: 12000,
    weight: 4380,
    location: "B-2",
    layer: 2,
  },
  {
    id: 3,
    qrNumber: "QR-7712-A45",
    manufacturer: "Dongkuk Steel",
    material: "SHN490",
    thickness: 25.0,
    width: 1500,
    length: 8000,
    weight: 2355,
    location: "A-1",
    layer: 5,
  },
  {
    id: 4,
    qrNumber: "QR-5561-B99",
    manufacturer: "Hyundai Steel",
    material: "SS400",
    thickness: 8.0,
    width: 2000,
    length: 6000,
    weight: 942,
    location: "C-2",
    layer: 3,
  },
];

export default function Web_WipListPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [rows, setRows] = useState(mockRows);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
  };

  const handleSearch = () => {
    console.log("조회 조건:", filters);

    // 나중에 백엔드 연동 시 여기에 API 호출
    // 예:
    // const response = await fetchInventoryList(filters);
    // setRows(response.rows);
  };

  return (
    <Web_AppLayout pageTitle="재고현황">
      <div className="space-y-8">
        <Web_InventoryFilterSection
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          onSearch={handleSearch}
        />

        <Web_InventoryTableSection
          rows={rows}
          totalCount={128}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </Web_AppLayout>
  );
}
