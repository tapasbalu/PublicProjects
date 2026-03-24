with source as (

    select * from {{ source('tpch', 'supplier') }}

),

renamed as (

    select
        -- primary key
        s_suppkey       as supplier_key,

        -- foreign keys
        s_nationkey     as nation_key,

        -- supplier attributes
        s_name          as supplier_name,
        s_address       as supplier_address,
        s_phone         as phone_number,
        s_acctbal       as account_balance,
        s_comment       as supplier_comment

    from source

)

select * from renamed
