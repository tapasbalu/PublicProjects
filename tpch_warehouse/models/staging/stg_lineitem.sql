with source as (

    select * from {{ source('tpch', 'lineitem') }}

),

renamed as (

    select
        -- primary key (composite)
        l_orderkey                                          as order_key,
        l_linenumber                                        as line_number,

        -- foreign keys
        l_partkey                                           as part_key,
        l_suppkey                                           as supplier_key,

        -- line item attributes
        l_quantity                                          as quantity,
        l_extendedprice                                     as extended_price,
        l_discount                                          as discount_percentage,
        l_tax                                               as tax_percentage,

        -- calculated revenue fields
        l_extendedprice * (1 - l_discount)                 as net_revenue,
        l_extendedprice * (1 - l_discount) * (1 + l_tax)   as gross_revenue,

        -- status flags
        l_returnflag                                        as return_flag,
        l_linestatus                                        as line_status,

        -- dates
        l_shipdate                                          as ship_date,
        l_commitdate                                        as commit_date,
        l_receiptdate                                       as receipt_date,

        -- shipping details
        l_shipinstruct                                      as ship_instructions,
        l_shipmode                                          as ship_mode,
        l_comment                                           as line_comment

    from source

)

select * from renamed
