with parts as (

    select * from {{ ref('stg_part') }}

),

final as (

    select
        -- primary key
        part_key,

        -- part attributes
        part_name,
        manufacturer,
        brand,
        part_type,
        part_size,
        container_type,
        retail_price

    from parts

)

select * from final
