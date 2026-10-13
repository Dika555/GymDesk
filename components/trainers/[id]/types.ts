export type Trainer = {
    id: string;
    name: string;
    phone: string;
    specialization: string;
    price_per_session: number;
    status: string;
};

export type TrainerPackage = {
    id: string;
    name: string;
    session_count: number;
    price: number;
    status: string;
};

export type TrainerMember = {
    id: string;
    name: string;
    remaining_sessions: number;
    has_active_package: boolean;
};

export type AvailableMember = {
    id: string;
    name: string;
};

export type TrainerPackageMember = {
    id: string;
    member_id: string;
    trainer_package_id: string;
    total_sessions: number;
    remaining_sessions: number;
    purchase_date: string;
    status: string;
    member_name: string;
    package_name: string;
};

export type TrainerSession = {
    id: string;
    member_name: string;
    session_date: string;
    notes: string | null;
    price: number;
    payment_method: string | null;
    session_type: "package" | "single";
};