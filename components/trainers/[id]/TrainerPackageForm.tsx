import type { FormEventHandler } from "react";

type Props = {
    packageName: string;
    packageSessionCount: string;
    packagePrice: string;
    onPackageNameChange: (value: string) => void;
    onPackageSessionCountChange: (value: string) => void;
    onPackagePriceChange: (value: string) => void;
    onSubmit: FormEventHandler<HTMLFormElement>;
};

export default function TrainerPackageForm({
    packageName,
    packageSessionCount,
    packagePrice,
    onPackageNameChange,
    onPackageSessionCountChange,
    onPackagePriceChange,
    onSubmit,
}: Props) {
    return (
        <form
            id="trainer-package-form"
            onSubmit={onSubmit}
            className="space-y-5"
        >
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Nama Paket
                </label>

                <input
                    type="text"
                    value={packageName}
                    onChange={(e) =>
                        onPackageNameChange(e.target.value)
                    }
                    placeholder="Contoh: Paket 10 Sesi"
                    className="w-full rounded-lg border px-3 py-2"
                    required
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Jumlah Sesi
                </label>

                <input
                    type="number"
                    min="1"
                    value={packageSessionCount}
                    onChange={(e) =>
                        onPackageSessionCountChange(e.target.value)
                    }
                    placeholder="Contoh: 10"
                    className="w-full rounded-lg border px-3 py-2"
                    required
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Harga Paket
                </label>

                <input
                    type="number"
                    min="0"
                    value={packagePrice}
                    onChange={(e) =>
                        onPackagePriceChange(e.target.value)
                    }
                    placeholder="Contoh: 500000"
                    className="w-full rounded-lg border px-3 py-2"
                    required
                />
            </div>
        </form>
    );
}